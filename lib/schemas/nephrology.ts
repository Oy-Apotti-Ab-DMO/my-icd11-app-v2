import { JevSchema } from '../types';

export const NEPHROLOGY_SCHEMA: JevSchema = {
  condition: {
    type: 'choice',
    criteria: {
      'Chronic kidney disease': 'Chronic kidney disease (CKD stages 1-5) or chronic renal failure',
      'Acute kidney injury': 'Acute renal failure, acute tubular necrosis, sudden elevation of creatinine',
      'Nephrotic syndrome': 'Heavy proteinuria, hypoalbuminaemia, peripheral oedema',
      'Glomerulonephritis': 'Nephritic syndrome, IgA nephropathy, membranous or crescentic glomerulonephritis',
      'Polycystic kidney disease': 'Autosomal dominant or recessive polycystic kidney disease',
      'End stage renal disease': 'ESRD requiring haemodialysis, peritoneal dialysis, or transplant',
      'Other renal disorder': 'Other kidney or urological-renal condition',
      'None': 'No nephrology condition identified'
    }
  },
  severity: {
    type: 'choice',
    criteria: {
      'Stage 1': 'Kidney damage with normal or increased GFR (>90 mL/min)',
      'Stage 2': 'Mild reduction in GFR (60-89 mL/min)',
      'Stage 3': 'Moderate reduction in GFR (30-59 mL/min)',
      'Stage 4': 'Severe reduction in GFR (15-29 mL/min)',
      'Stage 5 / End-stage': 'Kidney failure (GFR <15 mL/min)',
      'Severe': 'Severe acute deterioration or critical illness',
      'Moderate': 'Moderate disease severity',
      'Mild': 'Mild disease severity',
      'Unspecified': 'Stage or severity not specified'
    }
  },
  temporality: {
    type: 'choice',
    criteria: {
      'Acute': 'Acute onset, acute decompensation, or sudden loss of kidney function',
      'Chronic': 'Longstanding chronic kidney impairment',
      'Subacute': 'Subacute progression over several weeks to months',
      'Unspecified': 'Temporality not specified'
    }
  }
};
