import { JevSchema } from '../types';

export const GASTROENTEROLOGY_SCHEMA: JevSchema = {
  condition: {
    type: 'choice',
    criteria: {
      'Crohn disease': 'Crohn disease, regional enteritis, terminal ileitis or granulomatous colitis',
      'Ulcerative colitis': 'Ulcerative colitis, proctitis, pancolitis or inflammatory bowel disease NOS',
      'Gastro-oesophageal reflux disease': 'GERD, reflux oesophagitis or heartburn disorder',
      'Peptic ulcer disease': 'Gastric ulcer, duodenal ulcer or peptic ulceration',
      'Acute pancreatitis': 'Acute inflammation or necrosis of the pancreas',
      'Chronic pancreatitis': 'Chronic calcifying or relapsing pancreatitis',
      'Cirrhosis of liver': 'Liver cirrhosis, hepatic fibrosis or portal hypertension',
      'Other GI disorder': 'Other gastrointestinal, hepatobiliary or pancreatic disease',
      'None': 'No gastroenterology condition identified'
    }
  },
  pattern: {
    type: 'choice',
    criteria: {
      'Acute flare': 'Acute flare-up, exacerbation or attack',
      'Chronic remission': 'Disease in clinical or endoscopic remission',
      'Chronic active': 'Ongoing active chronic symptoms',
      'Unspecified': 'Clinical pattern not specified'
    }
  },
  severity: {
    type: 'choice',
    criteria: {
      'Mild': 'Mild symptoms, low inflammatory activity',
      'Moderate': 'Moderate disease activity or moderate complications',
      'Severe': 'Severe attack, toxic megacolon, deep bleeding or perforation',
      'Unspecified': 'Severity not specified'
    }
  },
  temporality: {
    type: 'choice',
    criteria: {
      'Acute': 'Acute onset or rapid sudden deterioration',
      'Chronic': 'Chronic underlying condition',
      'Subacute': 'Subacute progression',
      'Unspecified': 'Temporality not specified'
    }
  },
  anatomical_site: {
    type: 'choice',
    criteria: {
      'Stomach': 'Stomach or gastric mucosa',
      'Duodenum': 'Duodenum',
      'Small intestine / Ileum': 'Small bowel, ileum or jejunum',
      'Colon / Rectum': 'Large intestine, colon, or rectum',
      'Oesophagus': 'Oesophagus or gastro-oesophageal junction',
      'Liver / Biliary': 'Liver, gallbladder or bile ducts',
      'Pancreas': 'Pancreatic parenchyma',
      'Unspecified': 'Site not specified'
    }
  }
};
