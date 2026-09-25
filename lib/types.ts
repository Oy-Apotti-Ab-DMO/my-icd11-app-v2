export type QuestionType = 'choice' | 'score' | 'noul';

export interface JevQuestion {
  type: QuestionType;
  instructions?: string;
  criteria?: Record<string, string>;
}

export type JevSchema = Record<string, JevQuestion>;

export interface ExtractedEntities {
  condition?: string;
  primary_condition?: string;
  secondary_condition?: string;
  diabetes_type?: string;
  pattern?: string;
  severity?: string;
  temporality?: string;
  laterality?: string;
  anatomical_site?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface MatchingPV {
  propertyId?: string;
  label?: string;
  score?: number;
  foundationUri?: string;
}

export interface IcdCandidate {
  theCode?: string;
  title?: string;
  chapter?: string;
  score?: number;
  stemId?: string;
  foundationUri?: string;
  matchingPVs?: MatchingPV[];
  baseCode?: string;
  extensionCodes?: string[];
  [key: string]: unknown;
}

export interface RouterScores {
  [specialtyKey: string]: number;
}

export interface SpecialtyConfig {
  key: string;
  name: string;
  routerField: string;
  routerInstructions: string;
  schema: JevSchema;
  extractSearchTerm: (entities: ExtractedEntities) => string;
}

export interface ExtractionApiResponse {
  success?: boolean;
  latencyMs?: number;
  routerScores?: Record<string, number>;
  activeSpecialties?: string[];
  extractedEntities?: ExtractedEntities;
  searchTerm?: string;
  icdCandidates?: IcdCandidate[];
  icdStatusMessage?: string;
  error?: string;
}
