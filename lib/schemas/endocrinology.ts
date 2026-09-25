import { JevSchema } from '../types';

export const ENDOCRINOLOGY_SCHEMA: JevSchema = {
  condition: {
    type: 'choice',
    criteria: {
      'Type 2 Diabetes Mellitus': 'Patient has Type 2 Diabetes Mellitus',
      'Type 1 Diabetes Mellitus': 'Patient has Type 1 Diabetes Mellitus',
      'Hypothyroidism': 'Underactive thyroid / Hashimoto thyroiditis / myxedema',
      'Hyperthyroidism': 'Overactive thyroid / Graves disease / thyrotoxicosis',
      'Adrenal insufficiency': 'Addison disease, adrenal crisis or hypoadrenalism',
      'Cushing syndrome': 'Hypercortisolism or Cushing syndrome',
      'Other endocrine disorder': 'Other endocrine or metabolic disorder',
      'None': 'No endocrine condition identified'
    }
  },
  severity: {
    type: 'choice',
    criteria: {
      'Mild': 'Mild severity or stage',
      'Moderate': 'Moderate severity or stage',
      'Severe': 'Severe, profound, crisis or uncontrolled severity',
      'Unspecified': 'Severity is not explicitly stated'
    }
  },
  temporality: {
    type: 'choice',
    criteria: {
      'Acute': 'Acute onset, acute crisis, or acute decompensation',
      'Chronic': 'Chronic longstanding condition',
      'Subacute': 'Subacute condition',
      'Unspecified': 'Temporality not specified'
    }
  }
};
