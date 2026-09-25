import { JevSchema } from '../types';

export const RESPIRATORY_SCHEMA: JevSchema = {
  condition: {
    type: 'choice',
    criteria: {
      'Asthma': 'Asthma, allergic asthma, bronchial asthma, cough variant asthma',
      'Chronic obstructive pulmonary disease': 'COPD, chronic obstructive bronchitis, or emphysema',
      'Pneumonia': 'Infectious lung pneumonia, bronchopneumonia, or lobar pneumonia',
      'Acute bronchitis': 'Acute tracheobronchitis or acute chest infection',
      'Pulmonary embolism': 'Thromboembolism or clot in pulmonary vasculature',
      'Interstitial lung disease': 'Pulmonary fibrosis, sarcoidosis, or interstitial pneumonitis',
      'Bronchiectasis': 'Dilated bronchial airways with chronic sputum',
      'Other respiratory disease': 'Other lower or upper respiratory disorder',
      'None': 'No respiratory condition identified'
    }
  },
  pattern: {
    type: 'choice',
    criteria: {
      'Acute attack': 'Acute attack, acute exacerbation, crisis or sudden bronchospasm',
      'Status asthmaticus': 'Refractory acute severe attack unresponsive to initial bronchodilators',
      'Chronic persistent': 'Chronic persistent everyday symptoms without acute flare',
      'Unspecified': 'Clinical pattern not explicitly specified'
    }
  },
  severity: {
    type: 'choice',
    criteria: {
      'Mild': 'Mild intermittent or mild persistent symptoms',
      'Moderate': 'Moderate persistent symptoms or moderate severity',
      'Severe': 'Severe, near-fatal, life-threatening or intensive care level',
      'Unspecified': 'Severity is not specified'
    }
  },
  temporality: {
    type: 'choice',
    criteria: {
      'Acute': 'Acute onset, acute flare-up or acute attack',
      'Chronic': 'Chronic or long-standing underlying disease',
      'Subacute': 'Subacute progression over several weeks',
      'Unspecified': 'Temporality is not specified'
    }
  }
};
