import { IcdCandidate, ExtractedEntities } from '../types';

export interface IcdSearchOptions {
  apiUrl?: string;
  timeoutMs?: number;
  subtreesFilter?: string;
  chapterFilter?: string;
}

/**
 * Builds search query candidates from extracted clinical entities.
 * Generates specific-to-general queries to ensure high precision while preventing 0-result searches.
 */
export function buildSearchQueryCandidates(entities: ExtractedEntities): string[] {
  const primary = entities.condition || entities.primary_condition || entities.diabetes_type || '';
  const pattern = entities.pattern && !entities.pattern.includes('Unspecified') ? entities.pattern : '';
  const severity = entities.severity && !entities.severity.includes('Unspecified') ? entities.severity : '';
  const site = entities.anatomical_site && !entities.anatomical_site.includes('Unspecified') ? entities.anatomical_site : '';

  const candidates: string[] = [];

  // Filter primary condition
  const validPrimary = (primary && primary !== 'None' && primary !== 'Other') ? primary : '';

  if (validPrimary) {
    // 1. Condition + Severity e.g. "Asthma severe" (matches ICD-11 indexed titles)
    if (severity) {
      const cleanSev = severity.replace(/Stage\s*\d+/i, '').trim();
      candidates.push(`${validPrimary} ${cleanSev || severity}`.trim());
    }

    // 2. Condition + Pattern e.g. "Asthma Acute attack"
    if (pattern) {
      candidates.push(`${validPrimary} ${pattern}`.trim());
    }

    // 3. Condition + Anatomical Site e.g. "Crohn disease ileum"
    if (site) {
      const cleanSite = site.includes('/') ? site.split('/')[1].trim() : site;
      candidates.push(`${validPrimary} ${cleanSite}`.trim());
    }

    // 4. Exact primary condition itself e.g. "Asthma", "Heart failure", "Pressure injury"
    candidates.push(validPrimary);

    // 5. Common synonym expansions (e.g. "Pressure injury" -> "Pressure ulcer")
    if (validPrimary.toLowerCase().includes('pressure injury')) {
      candidates.push('Pressure ulcer');
    }
  }

  // De-duplicate
  return Array.from(new Set(candidates.filter(c => c.trim().length > 0)));
}

/**
 * Builds default single search query string from extracted clinical entities.
 */
export function buildIcdSearchQuery(entities: ExtractedEntities): string {
  const candidates = buildSearchQueryCandidates(entities);
  return candidates[0] || '';
}

/**
 * Queries the local WHO ICD-API instance for MMS candidate concepts.
 * Tries candidates sequentially from most specific to general until results are found.
 */
export async function searchLocalIcdApi(
  query: string | string[],
  options: IcdSearchOptions = {}
): Promise<{ candidates: IcdCandidate[]; statusMessage: string; executedQuery?: string }> {
  const apiUrl = options.apiUrl || process.env.NEXT_PUBLIC_LOCAL_ICD_API_URL || 'http://localhost:8382';
  const timeoutMs = options.timeoutMs ?? 4000;

  const queries = Array.isArray(query) ? query : [query];

  for (const q of queries) {
    if (!q || !q.trim()) continue;

    try {
      const encodedQuery = encodeURIComponent(q.trim());
      const url = `${apiUrl}/icd/release/11/2026-01/mms/search?q=${encodedQuery}`;

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en',
          'API-Version': 'v2'
        },
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (!res.ok) {
        continue;
      }

      const data = (await res.json()) as { destinationEntities?: IcdCandidate[] };
      const candidates = data.destinationEntities || [];

      if (candidates.length > 0) {
        return {
          candidates,
          statusMessage: `Found ${candidates.length} candidate(s) for query "${q}"`,
          executedQuery: q
        };
      }
    } catch {
      // Continue to next fallback query
    }
  }

  return {
    candidates: [],
    statusMessage: `No candidates found across query candidates: ${queries.join(' | ')}`
  };
}
