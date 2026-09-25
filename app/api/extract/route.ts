import { NextResponse } from 'next/server';
import { JevSchema, ExtractedEntities, IcdCandidate, ExtractionApiResponse } from '@/lib/types';
import {
  buildUniversalRouterSchema,
  getActiveSpecialties,
  SPECIALTY_REGISTRY
} from '@/lib/schemas/registry';
import { buildIcdSearchQuery, buildSearchQueryCandidates, searchLocalIcdApi } from '@/lib/icd/client';
import { resolveExtensionCodes, buildPostCoordinatedCode } from '@/lib/icd/extensions';

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const { providerNote } = (await request.json()) as { providerNote?: string };

    if (!providerNote || !providerNote.trim()) {
      return NextResponse.json(
        { error: 'Provider note is required' },
        { status: 400 }
      );
    }

    // --- PASS 1: Universal Router Call ---
    const routerSchema = buildUniversalRouterSchema();
    const routerRaw = await callJevApi(providerNote, routerSchema);

    // Extract router confidence scores
    const routerScores: Record<string, number> = {};
    for (const [key, conf] of Object.entries(routerRaw)) {
      if (typeof conf === 'number') {
        routerScores[key] = conf;
      }
    }

    // Determine active specialties (threshold > 0.7 or highest fallback)
    const activeSpecialties = getActiveSpecialties(routerScores, 0.7);

    // --- PASS 2: Active Specialty Calls ---
    let mergedEntities: ExtractedEntities = {};
    const activeSpecialtyKeys = activeSpecialties.map((s) => s.key);

    if (activeSpecialties.length > 0) {
      const specialtyResults = await Promise.all(
        activeSpecialties.map((spec) => callJevApi(providerNote, spec.schema))
      );
      mergedEntities = Object.assign({}, ...specialtyResults);
    }

    // Build search query candidates
    const queryCandidates = buildSearchQueryCandidates(mergedEntities);
    const specialtySearchTerm = activeSpecialties.length > 0
      ? activeSpecialties[0].extractSearchTerm(mergedEntities)
      : '';

    const allQueries = Array.from(new Set([specialtySearchTerm, ...queryCandidates].filter(Boolean)));
    const searchTerm = allQueries[0] || '';

    // --- PASS 3: Local ICD-API Search & Post-Coordination ---
    let candidates: IcdCandidate[] = [];
    let icdStatusMessage = 'No query formed';
    let executedQuery = searchTerm;

    if (allQueries.length > 0) {
      const searchRes = await searchLocalIcdApi(allQueries);
      icdStatusMessage = searchRes.statusMessage;
      executedQuery = searchRes.executedQuery || searchTerm;

      // Resolve extension codes from entities (laterality, anatomical site, temporality, severity)
      const extensionCodes = resolveExtensionCodes(mergedEntities);

      // Post-coordinate candidate codes
      candidates = searchRes.candidates.map((candidate) => {
        if (candidate.theCode) {
          const postCoordinated = buildPostCoordinatedCode(candidate.theCode, extensionCodes);
          return {
            ...candidate,
            baseCode: postCoordinated.baseCode,
            extensionCodes: postCoordinated.extensionCodes,
            theCode: postCoordinated.fullCode
          };
        }
        return candidate;
      });
    }

    const totalLatencyMs = Date.now() - startTime;

    const responseData: ExtractionApiResponse = {
      success: true,
      latencyMs: totalLatencyMs,
      routerScores,
      activeSpecialties: activeSpecialtyKeys,
      extractedEntities: mergedEntities,
      searchTerm,
      icdCandidates: candidates,
      icdStatusMessage
    };

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Live helper calling TypeSafe System One Jev API
 */
async function callJevApi(
  state: string,
  questions: JevSchema
): Promise<ExtractedEntities> {
  const apiKey = process.env.TYPESAFE_API_KEY;

  if (!apiKey) {
    throw new Error('TYPESAFE_API_KEY is not configured in .env.local');
  }

  const response = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'jev-latest',
      state,
      questions
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Jev API Error (${response.status}): ${errorText || response.statusText}`);
  }

  const rawData = (await response.json()) as {
    answers?: Record<string, { type: string; noul?: number; choice?: string; score?: number }>;
  };

  const parsedEntities: ExtractedEntities = {};

  if (rawData.answers) {
    for (const [key, value] of Object.entries(rawData.answers)) {
      if (value.type === 'noul' && typeof value.noul === 'number') {
        parsedEntities[key] = value.noul;
      } else if (value.type === 'choice' && typeof value.choice === 'string') {
        parsedEntities[key] = value.choice;
      } else if (value.type === 'score' && typeof value.score === 'number') {
        parsedEntities[key] = value.score;
      }
    }
  }

  return parsedEntities;
}
