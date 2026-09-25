'use client';

import React, { useState } from 'react';
import { ExtractionApiResponse } from '@/lib/types';

export default function PipelinePage() {
  const [providerNote, setProviderNote] = useState(
    'Patient presents with severe acute attack of asthma, wheezing and marked respiratory distress.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionApiResponse | null>(null);

  const sampleNotes = [
    {
      title: 'Pulmonology (Asthma attack)',
      text: 'Patient presents with severe acute attack of asthma, wheezing and marked respiratory distress.'
    },
    {
      title: 'Cardiology (Heart failure)',
      text: 'Patient known for ischemic cardiomyopathy presents with acute decompensation of severe congestive heart failure and orthopnea.'
    },
    {
      title: 'Wound Care (Diabetic ulcer)',
      text: 'Patient presents with chronic diabetic foot ulcer on the left heel with moderate depth and signs of local inflammation.'
    },
    {
      title: 'Nephrology (CKD)',
      text: 'Patient has long-standing stage 4 chronic kidney disease with worsening creatinine and proteinuria.'
    },
    {
      title: 'Gastroenterology (Crohn disease)',
      text: 'Patient with known Crohn disease presents with severe acute flare affecting the small intestine and terminal ileum.'
    }
  ];

  const handleRunPipeline = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerNote })
      });

      const data = (await res.json()) as ExtractionApiResponse;
      setResult(data);
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : 'Failed to connect to backend'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to sanitize HTML tags like <em class='found'> from WHO titles/labels
  const stripHtml = (htmlStr?: string) => {
    if (!htmlStr) return '';
    return htmlStr.replace(/<[^>]*>?/gm, '');
  };

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8 font-sans">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Multi-Specialty ICD-11 Pipeline
        </h1>
        <p className="text-sm text-gray-600">
          Universal Router (Pass 1) &rarr; Active Specialty Extraction (Pass 2) &rarr; Local ICD-11 &amp; Post-Coordination
        </p>
      </header>

      {/* Preset sample buttons */}
      <section className="space-y-2">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Quick Sample Notes
        </label>
        <div className="flex flex-wrap gap-2">
          {sampleNotes.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setProviderNote(sample.text)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md border border-gray-300 font-medium transition-colors"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </section>

      {/* Input Section */}
      <section className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Clinical Provider Note
        </label>
        <textarea
          className="w-full h-28 p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          value={providerNote}
          onChange={(e) => setProviderNote(e.target.value)}
        />
        <button
          onClick={handleRunPipeline}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm shadow transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing Two-Pass Pipeline...' : 'Run ICD-11 Extraction'}
        </button>
      </section>

      {/* Results Section */}
      {result && (
        <div className="space-y-8">
          {result.error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <>
              {/* Performance Latency Header */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border text-sm font-medium">
                <div className="space-x-4">
                  <span className="text-gray-700">
                    Active Specialties:{' '}
                    <strong>
                      {result.activeSpecialties?.join(', ') || 'None (>0.7)'}
                    </strong>
                  </span>
                  {result.searchTerm && (
                    <span className="text-gray-600">
                      Search Query: <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">{result.searchTerm}</code>
                    </span>
                  )}
                </div>
                <span className="text-blue-600 font-bold">
                  ⚡ {result.latencyMs ?? 0} ms total
                </span>
              </div>

              {/* 1. Pass 1 Router Scores */}
              {result.routerScores && Object.keys(result.routerScores).length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-gray-800">
                    Pass 1: Universal Router Confidence
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(result.routerScores).map(([key, score]) => {
                      const isActive = score > 0.7;
                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-md border text-xs ${
                            isActive
                              ? 'bg-blue-50 border-blue-300 font-semibold text-blue-900'
                              : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono">{key}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                              {(score * 100).toFixed(0)}%
                            </span>
                          </div>
                          {isActive && <span className="text-[10px] text-blue-700 font-bold mt-1 block">Triggered (&gt; 0.70)</span>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 2. Jev Extracted Entries Table */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-800">
                  Pass 2: Specialty Extracted Entities
                </h2>
                {result.extractedEntities &&
                Object.keys(result.extractedEntities).length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Entity Field
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Extracted Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {Object.entries(result.extractedEntities).map(
                          ([key, val]) => (
                            <tr key={key} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-mono text-xs font-semibold text-gray-600">
                                {key}
                              </td>
                              <td className="px-4 py-2 text-gray-900 font-medium">
                                {String(val)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No entities extracted.</p>
                )}
              </section>

              {/* 3. Local ICD-API Lookups Table */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">
                    Pass 3: Post-Coordinated ICD-11 Codes
                  </h2>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                    Status: {result.icdStatusMessage}
                  </span>
                </div>

                {result.icdCandidates && result.icdCandidates.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Post-Coordinated Code
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Title / Concept
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Extensions
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Score
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Matched Synonyms
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {result.icdCandidates.map((candidate, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 align-top">
                            <td className="px-4 py-3 font-mono font-bold text-blue-700 text-base">
                              {candidate.theCode || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              <div className="font-semibold">
                                {stripHtml(candidate.title)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Base: <code className="bg-gray-100 px-1 py-0.5 rounded">{candidate.baseCode || candidate.theCode}</code>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-700">
                              {candidate.extensionCodes && candidate.extensionCodes.length > 0 ? (
                                <div className="space-y-1">
                                  {candidate.extensionCodes.map((ext, extIdx) => (
                                    <span
                                      key={extIdx}
                                      className="inline-block bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded mr-1"
                                    >
                                      &amp;{ext}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                              {typeof candidate.score === 'number'
                                ? candidate.score.toFixed(3)
                                : 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              {candidate.matchingPVs &&
                              candidate.matchingPVs.length > 0 ? (
                                <ul className="space-y-2 text-xs">
                                  {candidate.matchingPVs.map((pv, pvIdx) => (
                                    <li
                                      key={pvIdx}
                                      className="p-2 bg-gray-50 rounded border border-gray-100"
                                    >
                                      <div className="font-medium text-gray-800">
                                        • {stripHtml(pv.label)}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  None
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No matching candidate codes returned.
                  </p>
                )}
              </section>

              {/* 4. Raw JSON Presentations */}
              <section className="space-y-4 pt-4 border-t">
                <h3 className="text-md font-bold text-gray-700">
                  Raw JSON Data Outputs
                </h3>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Extracted Entities JSON
                  </h4>
                  <pre className="p-3 bg-gray-900 text-green-400 text-xs rounded-md overflow-x-auto font-mono">
                    {JSON.stringify(result.extractedEntities, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    ICD-11 Candidates JSON
                  </h4>
                  <pre className="p-3 bg-gray-900 text-green-400 text-xs rounded-md overflow-x-auto font-mono max-h-96">
                    {JSON.stringify(result.icdCandidates, null, 2)}
                  </pre>
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </main>
  );
}
