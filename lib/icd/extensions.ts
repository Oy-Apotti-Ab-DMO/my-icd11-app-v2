/**
 * ICD-11 Extension Code mappings for post-coordination
 * Reference: WHO ICD-11 MMS Chapter X (Extension Codes)
 */

export const SEVERITY_EXTENSION_CODES: Record<string, string> = {
  'Mild': 'XS5W',
  'Moderate': 'XS0T',
  'Severe': 'XS25',
  'Profound': 'XS2R',
  'None': 'XS8H'
};

export const TEMPORALITY_EXTENSION_CODES: Record<string, string> = {
  'Acute': 'XT5R',
  'Subacute': 'XT1L',
  'Chronic': 'XT8W'
};

export const LATERALITY_EXTENSION_CODES: Record<string, string> = {
  'Left': 'XK8G',
  'Right': 'XK9J',
  'Bilateral': 'XK8G&XK9J'
};

export const ANATOMICAL_SITE_EXTENSION_CODES: Record<string, string> = {
  'Foot': 'XA47V8',
  'Toe': 'XA4LC9',
  'Great toe': 'XA2RP7',
  'Heel': 'XA5HK0',
  'Ankle': 'XA67V4',
  'Lower leg': 'XA3YG1',
  'Knee': 'XA8KL5',
  'Thigh': 'XA5S78',
  'Buttock': 'XA3VA7',
  'Sacrum': 'XA3VA7',
  'Hand': 'XA5R12',
  'Wrist': 'XA2J63',
  'Forearm': 'XA7WB0',
  'Elbow': 'XA9FF8',
  'Upper arm': 'XA6809',
  'Shoulder': 'XA2ND5',
  'Upper extremity': 'XA4BA8',
  'Lower extremity': 'XA45A6'
};

export interface ExtensionResolutionInput {
  severity?: string;
  temporality?: string;
  laterality?: string;
  anatomical_site?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface PostCoordinationResult {
  fullCode: string;
  baseCode: string;
  extensionCodes: string[];
}

/**
 * Resolves Jev-extracted clinical entities to ICD-11 Chapter X extension codes.
 */
export function resolveExtensionCodes(entities: ExtensionResolutionInput): string[] {
  const extensionCodes: string[] = [];

  // 1. Laterality
  if (entities.laterality && LATERALITY_EXTENSION_CODES[entities.laterality]) {
    const latCode = LATERALITY_EXTENSION_CODES[entities.laterality];
    // Bilateral may already contain '&' e.g. XK8G&XK9J
    for (const code of latCode.split('&')) {
      if (code && !extensionCodes.includes(code)) {
        extensionCodes.push(code);
      }
    }
  }

  // 2. Anatomical Site
  if (entities.anatomical_site && ANATOMICAL_SITE_EXTENSION_CODES[entities.anatomical_site]) {
    const anatCode = ANATOMICAL_SITE_EXTENSION_CODES[entities.anatomical_site];
    if (anatCode && !extensionCodes.includes(anatCode)) {
      extensionCodes.push(anatCode);
    }
  }

  // 3. Temporality
  if (entities.temporality && TEMPORALITY_EXTENSION_CODES[entities.temporality]) {
    const tempCode = TEMPORALITY_EXTENSION_CODES[entities.temporality];
    if (tempCode && !extensionCodes.includes(tempCode)) {
      extensionCodes.push(tempCode);
    }
  }

  // 4. Severity (check directly or normalized)
  if (entities.severity) {
    const normSev = entities.severity.includes('Severe')
      ? 'Severe'
      : entities.severity.includes('Moderate')
      ? 'Moderate'
      : entities.severity.includes('Mild')
      ? 'Mild'
      : entities.severity;

    if (SEVERITY_EXTENSION_CODES[normSev]) {
      const sevCode = SEVERITY_EXTENSION_CODES[normSev];
      if (sevCode && !extensionCodes.includes(sevCode)) {
        extensionCodes.push(sevCode);
      }
    }
  }

  return extensionCodes;
}

/**
 * Builds an ICD-11 post-coordinated code string.
 *
 * ICD-11 Syntax:
 * - Base stem code: e.g. CA23.0
 * - Extension code post-coordination: '&' e.g. CA23.0&XS25 or CA23.0&XS25&XT5R
 * - Cluster post-coordination: '/' e.g. BD54/MC85
 *
 * If the candidate theCode already contains post-coordination (e.g., from WHO index),
 * this function avoids duplicate extension codes.
 */
export function buildPostCoordinatedCode(
  rawCandidateCode: string,
  extensionCodes: string[]
): PostCoordinationResult {
  if (!rawCandidateCode) {
    return { fullCode: '', baseCode: '', extensionCodes: [] };
  }

  // Split on cluster delimiter '/' first if present
  const [clusterPrimary, ...clusterParts] = rawCandidateCode.split('/');

  // In the primary part, split on '&' to separate base stem from already appended extensions
  const [baseCode, ...existingExtensions] = clusterPrimary.split('&');

  const combinedExtensions = new Set<string>(existingExtensions);
  for (const ext of extensionCodes) {
    combinedExtensions.add(ext);
  }

  const finalExtensions = Array.from(combinedExtensions);
  let fullPrimary = baseCode;
  if (finalExtensions.length > 0) {
    fullPrimary = `${baseCode}&${finalExtensions.join('&')}`;
  }

  // Re-attach cluster parts if any
  let fullCode = fullPrimary;
  if (clusterParts.length > 0) {
    fullCode = `${fullPrimary}/${clusterParts.join('/')}`;
  }

  return {
    fullCode,
    baseCode,
    extensionCodes: finalExtensions
  };
}
