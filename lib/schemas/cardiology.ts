import { JevSchema } from '../types';

export const CARDIOLOGY_SCHEMA: JevSchema = {
  condition: {
    type: 'choice',
    criteria: {
      'Heart failure': 'Congestive heart failure, systolic or diastolic ventricular failure',
      'Atrial fibrillation': 'Atrial fibrillation or atrial flutter',
      'Acute myocardial infarction': 'STEMI, NSTEMI, heart attack or acute coronary syndrome',
      'Angina pectoris': 'Stable or unstable coronary angina or chest pain of ischaemic origin',
      'Hypertension': 'Essential hypertension, high blood pressure or hypertensive disease',
      'Aortic stenosis': 'Aortic valve stenosis or aortic valvular disease',
      'Other cardiac condition': 'Other cardiovascular or valvular heart disease',
      'None': 'No cardiac condition identified'
    }
  },
  pattern: {
    type: 'choice',
    criteria: {
      'Acute decompensation': 'Acute decompensated episode or sudden worsening',
      'Chronic stable': 'Chronic stable baseline condition',
      'Paroxysmal': 'Paroxysmal or intermittent episodes',
      'Persistent': 'Persistent or continuous pattern',
      'Unspecified': 'Clinical pattern not specified'
    }
  },
  severity: {
    type: 'choice',
    criteria: {
      'Mild': 'Mild, NYHA Class I or early stage',
      'Moderate': 'Moderate, NYHA Class II-III',
      'Severe': 'Severe, NYHA Class IV, cardiogenic shock or critical',
      'Unspecified': 'Severity not stated'
    }
  },
  temporality: {
    type: 'choice',
    criteria: {
      'Acute': 'Acute onset, acute event or acute exacerbation',
      'Chronic': 'Chronic pre-existing condition',
      'Subacute': 'Subacute presentation',
      'Unspecified': 'Temporality not stated'
    }
  }
};
