import { JevSchema, SpecialtyConfig, ExtractedEntities } from '../types';
import { ENDOCRINOLOGY_SCHEMA } from './endocrinology';
import { WOUNDCARE_SCHEMA } from './woundcare';
import { CARDIOLOGY_SCHEMA } from './cardiology';
import { RESPIRATORY_SCHEMA } from './respiratory';
import { PULMONOLOGY_SCHEMA } from './pulmonilogy';
import { NEPHROLOGY_SCHEMA } from './nephrology';
import { GASTROENTEROLOGY_SCHEMA } from './gastroenterology';

export const SPECIALTY_REGISTRY: Record<string, SpecialtyConfig> = {
  endocrinology: {
    key: 'endocrinology',
    name: 'Endocrinology',
    routerField: 'has_endocrinology',
    routerInstructions: 'Does the note involve endocrine, thyroid, diabetes, or metabolic conditions?',
    schema: ENDOCRINOLOGY_SCHEMA,
    extractSearchTerm: (entities: ExtractedEntities) => {
      const parts = [
        entities.condition && entities.condition !== 'None' ? entities.condition : '',
        entities.pattern && entities.pattern !== 'Unspecified' ? entities.pattern : ''
      ].filter(Boolean);
      return parts.join(' ');
    }
  },
  woundcare: {
    key: 'woundcare',
    name: 'Wound Care',
    routerField: 'has_woundcare',
    routerInstructions: 'Does the note involve skin wounds, diabetic foot ulcers, pressure sores, burns, or tissue necrosis?',
    schema: WOUNDCARE_SCHEMA,
    extractSearchTerm: (entities: ExtractedEntities) => {
      const parts = [
        entities.condition && entities.condition !== 'None' ? entities.condition : '',
        entities.anatomical_site && entities.anatomical_site !== 'Unspecified' ? entities.anatomical_site : ''
      ].filter(Boolean);
      return parts.join(' ');
    }
  },
  cardiology: {
    key: 'cardiology',
    name: 'Cardiology',
    routerField: 'has_cardiology',
    routerInstructions: 'Does the note involve heart, cardiovascular, coronary, myocardial, rhythm or blood pressure conditions?',
    schema: CARDIOLOGY_SCHEMA,
    extractSearchTerm: (entities: ExtractedEntities) => {
      const parts = [
        entities.condition && entities.condition !== 'None' ? entities.condition : '',
        entities.pattern && entities.pattern !== 'Unspecified' ? entities.pattern : ''
      ].filter(Boolean);
      return parts.join(' ');
    }
  },
  pulmonology: {
    key: 'pulmonology',
    name: 'Pulmonology',
    routerField: 'has_pulmonology',
    routerInstructions: 'Does the note involve respiratory, lung, asthma, COPD, pneumonia, or bronchial conditions?',
    schema: PULMONOLOGY_SCHEMA,
    extractSearchTerm: (entities: ExtractedEntities) => {
      const parts = [
        entities.condition && entities.condition !== 'None' ? entities.condition : '',
        entities.pattern && entities.pattern !== 'Unspecified' ? entities.pattern : ''
      ].filter(Boolean);
      return parts.join(' ');
    }
  },
  nephrology: {
    key: 'nephrology',
    name: 'Nephrology',
    routerField: 'has_nephrology',
    routerInstructions: 'Does the note involve kidney, renal, glomerulonephritis, proteinuria, or renal failure conditions?',
    schema: NEPHROLOGY_SCHEMA,
    extractSearchTerm: (entities: ExtractedEntities) => {
      const parts = [
        entities.condition && entities.condition !== 'None' ? entities.condition : '',
        entities.severity && !entities.severity.includes('Unspecified') ? entities.severity : ''
      ].filter(Boolean);
      return parts.join(' ');
    }
  },
  gastroenterology: {
    key: 'gastroenterology',
    name: 'Gastroenterology',
    routerField: 'has_gastroenterology',
    routerInstructions: 'Does the note involve gastrointestinal, bowel, stomach, Crohn, colitis, liver, or pancreas conditions?',
    schema: GASTROENTEROLOGY_SCHEMA,
    extractSearchTerm: (entities: ExtractedEntities) => {
      const parts = [
        entities.condition && entities.condition !== 'None' ? entities.condition : '',
        entities.anatomical_site && entities.anatomical_site !== 'Unspecified' ? entities.anatomical_site : ''
      ].filter(Boolean);
      return parts.join(' ');
    }
  }
};

/**
 * Builds the Pass 1 Universal Router schema dynamically from registered specialties.
 */
export function buildUniversalRouterSchema(): JevSchema {
  const routerSchema: JevSchema = {};
  for (const specialty of Object.values(SPECIALTY_REGISTRY)) {
    routerSchema[specialty.routerField] = {
      type: 'noul',
      instructions: specialty.routerInstructions
    };
  }
  return routerSchema;
}

/**
 * Finds all active specialties triggered with router confidence > threshold.
 */
export function getActiveSpecialties(
  routerOutput: Record<string, number | undefined>,
  threshold: number = 0.7
): SpecialtyConfig[] {
  const active: SpecialtyConfig[] = [];
  for (const specialty of Object.values(SPECIALTY_REGISTRY)) {
    const score = routerOutput[specialty.routerField] ?? 0;
    if (score > threshold) {
      active.push(specialty);
    }
  }

  // Fallback: If no specialty meets threshold, pick the highest scoring one if > 0.3
  if (active.length === 0) {
    let bestScore = 0.3;
    let bestSpecialty: SpecialtyConfig | null = null;
    for (const specialty of Object.values(SPECIALTY_REGISTRY)) {
      const score = routerOutput[specialty.routerField] ?? 0;
      if (score > bestScore) {
        bestScore = score;
        bestSpecialty = specialty;
      }
    }
    if (bestSpecialty) {
      active.push(bestSpecialty);
    }
  }

  return active;
}

export {
  ENDOCRINOLOGY_SCHEMA,
  WOUNDCARE_SCHEMA,
  CARDIOLOGY_SCHEMA,
  RESPIRATORY_SCHEMA,
  PULMONOLOGY_SCHEMA,
  NEPHROLOGY_SCHEMA,
  GASTROENTEROLOGY_SCHEMA
};
