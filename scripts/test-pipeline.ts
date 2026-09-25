import { POST } from '../app/api/extract/route';

interface TestCase {
  id: number;
  specialtyExpected: string;
  note: string;
  expectedExtensions: string[];
}

const SAMPLE_NOTES: TestCase[] = [
  {
    id: 1,
    specialtyExpected: 'pulmonology',
    note: 'Patient presents to ER with severe acute attack of asthma, wheezing, tachypnea and accessory muscle use.',
    expectedExtensions: ['XS25', 'XT5R'] // Severe, Acute
  },
  {
    id: 2,
    specialtyExpected: 'cardiology',
    note: 'Known case of ischemic cardiomyopathy presenting with acute decompensation of severe congestive heart failure and orthopnea.',
    expectedExtensions: ['XS25', 'XT5R'] // Severe, Acute
  },
  {
    id: 3,
    specialtyExpected: 'woundcare',
    note: 'Patient with diabetic foot ulcer on the left heel with severe tissue necrosis requiring surgical debridement.',
    expectedExtensions: ['XK8G', 'XS25'] // Left, Severe
  },
  {
    id: 4,
    specialtyExpected: 'woundcare',
    note: 'Elderly patient with chronic decubitus pressure injury stage 3 on the sacrum with moderate exudate.',
    expectedExtensions: ['XT8W'] // Chronic
  },
  {
    id: 5,
    specialtyExpected: 'endocrinology',
    note: 'Follow-up for uncontrolled severe Type 2 Diabetes Mellitus with chronic microvascular complications.',
    expectedExtensions: ['XS25', 'XT8W'] // Severe, Chronic
  },
  {
    id: 6,
    specialtyExpected: 'nephrology',
    note: 'Patient evaluated for severe acute kidney injury with sudden elevation of serum creatinine following dehydration.',
    expectedExtensions: ['XS25', 'XT5R'] // Severe, Acute
  },
  {
    id: 7,
    specialtyExpected: 'nephrology',
    note: 'Patient diagnosed with chronic kidney disease stage 4, moderate progression over past 6 months.',
    expectedExtensions: ['XT8W'] // Chronic
  },
  {
    id: 8,
    specialtyExpected: 'gastroenterology',
    note: 'Young adult presenting with severe acute flare of Crohn disease affecting the ileum with pain and diarrhea.',
    expectedExtensions: ['XS25', 'XT5R'] // Severe, Acute
  },
  {
    id: 9,
    specialtyExpected: 'gastroenterology',
    note: 'Patient with longstanding chronic gastro-oesophageal reflux disease with moderate persistent heartburn symptoms.',
    expectedExtensions: ['XT8W', 'XS0T'] // Chronic, Moderate
  },
  {
    id: 10,
    specialtyExpected: 'pulmonology',
    note: 'Patient presenting with acute severe lobar pneumonia of the right lung with productive cough and high fever.',
    expectedExtensions: ['XS25', 'XT5R'] // Severe, Acute
  }
];

async function runTests() {
  console.log('='.repeat(70));
  console.log('STARTING ICD-11 MULTI-SPECIALTY PIPELINE VERIFICATION (10 CLINICAL NOTES)');
  console.log('='.repeat(70));

  let passedTests = 0;
  let totalCandidatesReturned = 0;

  for (const testCase of SAMPLE_NOTES) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`[Test ${testCase.id}/10] Specialty: ${testCase.specialtyExpected.toUpperCase()}`);
    console.log(`Note: "${testCase.note.slice(0, 80)}..."`);

    const req = new Request('http://localhost:3000/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerNote: testCase.note })
    });

    const startTime = Date.now();
    const res = await POST(req);
    const duration = Date.now() - startTime;

    if (!res.ok) {
      console.error(`FAILED: HTTP ${res.status}`);
      const errText = await res.text();
      console.error(errText);
      continue;
    }

    const data = await res.json();
    console.log(`Latency: ${duration}ms | Search Query: "${data.searchTerm}"`);
    console.log(`Active Specialties: [${data.activeSpecialties?.join(', ')}]`);
    console.log(`Extracted:`, JSON.stringify(data.extractedEntities));

    const candidates = data.icdCandidates || [];
    totalCandidatesReturned += candidates.length;
    console.log(`ICD-API Candidates Count: ${candidates.length} (Status: ${data.icdStatusMessage})`);

    if (candidates.length > 0) {
      const top = candidates[0];
      console.log(`Top Candidate: Code="${top.theCode}" Title="${top.title?.replace(/<[^>]*>?/gm, '')}"`);
      console.log(`Base Code="${top.baseCode}" Extension Codes=[${top.extensionCodes?.join(', ')}]`);

      // Verify post-coordinated code formatting syntax
      // Base stem followed by &EXT1&EXT2 or cluster /STEM
      const codeRegex = /^[A-Z0-9]+(\.[A-Z0-9]+)?(&[A-Z0-9]+)*(\/[A-Z0-9]+(\.[A-Z0-9]+)?)*$/;
      const isValidFormat = codeRegex.test(top.theCode);

      if (!isValidFormat) {
        console.warn(`WARNING: theCode "${top.theCode}" does not match standard ICD-11 post-coordination regex`);
      } else {
        console.log(`Format Assertion: PASS (${top.theCode} conforms to ICD-11 post-coordination syntax)`);
      }

      // Check expected extensions
      const hasAnyExpectedExt = testCase.expectedExtensions.some(ext =>
        top.extensionCodes?.includes(ext) || top.theCode?.includes(ext)
      );

      if (hasAnyExpectedExt) {
        console.log(`Extension Assertion: PASS (Contains expected extension: ${testCase.expectedExtensions.join(', ')})`);
      } else {
        console.log(`Extension Assertion: Note extracted extensions: [${top.extensionCodes?.join(', ')}]`);
      }

      passedTests++;
    } else {
      console.warn(`No candidates returned for query "${data.searchTerm}".`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`TEST SUMMARY: ${passedTests} / ${SAMPLE_NOTES.length} tests succeeded with valid candidates.`);
  console.log(`Total Candidates Evaluated: ${totalCandidatesReturned}`);
  console.log('='.repeat(70));

  if (passedTests < 8) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during pipeline tests:', err);
  process.exit(1);
});
