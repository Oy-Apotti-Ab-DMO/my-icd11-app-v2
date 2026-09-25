import { JevSchema } from '../types';

export const WOUNDCARE_SCHEMA: JevSchema = {
  condition: {
    type: 'choice',
    criteria: {
      'Diabetic foot ulcer': 'Diabetic ulcer, neurotrophic ulcer or foot ulcer associated with diabetes',
      'Pressure injury': 'Decubitus ulcer, bedsore, pressure ulcer or pressure sore',
      'Venous ulcer': 'Venous stasis ulcer, stasis dermatitis ulcer or varicose ulcer',
      'Arterial ulcer': 'Ischaemic ulcer or peripheral arterial disease ulceration',
      'Surgical wound': 'Post-operative incision, dehiscent wound or surgical site issue',
      'Burn wound': 'Thermal, chemical or friction burn wound',
      'Other skin ulcer': 'Other cutaneous ulcer or open wound',
      'None': 'No wound care condition identified'
    }
  },
  severity: {
    type: 'choice',
    criteria: {
      'Mild': 'Superficial, partial thickness, or mild wound',
      'Moderate': 'Moderate depth, partial or full thickness without bone involvement',
      'Severe': 'Deep, gangrenous, necrotic, infected, or extensive ulceration',
      'Unspecified': 'Severity is not specified'
    }
  },
  temporality: {
    type: 'choice',
    criteria: {
      'Acute': 'Acute onset, acute trauma, or sudden deterioration',
      'Chronic': 'Chronic non-healing wound or long-standing ulcer',
      'Subacute': 'Subacute progression',
      'Unspecified': 'Duration not specified'
    }
  },
  laterality: {
    type: 'choice',
    criteria: {
      'Left': 'Located on the left side of the body or left extremity',
      'Right': 'Located on the right side of the body or right extremity',
      'Bilateral': 'Affects both left and right sides',
      'Unspecified': 'Laterality not specified or midline'
    }
  },
  anatomical_site: {
    type: 'choice',
    criteria: {
      'Foot': 'Foot, heel, forefoot, midfoot, plantar or dorsal foot surface',
      'Toe': 'Toes or great toe',
      'Ankle': 'Ankle region or malleolus',
      'Lower leg': 'Calf, shin or lower extremity excluding foot',
      'Sacrum': 'Sacral area, buttocks, coccyx or ischial tuberosity',
      'Upper extremity': 'Arm, hand, finger, or forearm',
      'Other site': 'Other anatomical location',
      'Unspecified': 'Anatomical site not specified'
    }
  }
};
