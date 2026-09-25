'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
      {/* Header with Apotti Labs Logo on top left */}
      <header className="border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="shrink-0 bg-white/90 dark:bg-white p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm inline-flex items-center">
            <Image
              src="/apottilabs.png"
              alt="Apotti Labs Logo"
              width={160}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Multi-Specialty ICD-11 Pipeline
            </h1>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
              Universal Router (Pass 1) &rarr; Active Specialty Extraction (Pass 2) &rarr; Local ICD-11 &amp; Post-Coordination
            </p>
          </div>
        </div>
      </header>

      {/* Preset sample buttons */}
      <section className="space-y-2">
        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
          Quick Sample Notes
        </label>
        <div className="flex flex-wrap gap-2">
          {sampleNotes.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setProviderNote(sample.text)}
              className="text-xs px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 rounded-md border border-gray-300 dark:border-gray-600 font-medium transition-colors shadow-xs"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </section>

      {/* Input Section */}
      <section className="space-y-3">
        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100">
          Clinical Provider Note
        </label>
        <textarea
          className="w-full h-28 p-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400"
          value={providerNote}
          onChange={(e) => setProviderNote(e.target.value)}
          placeholder="Enter or paste clinical narrative here..."
        />
        <button
          onClick={handleRunPipeline}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-md text-sm shadow transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? 'Processing Two-Pass Pipeline...' : 'Run ICD-11 Extraction'}
        </button>
      </section>

      {/* Results Section */}
      {result && (
        <div className="space-y-8">
          {result.error ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md text-sm">
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <>
              {/* Performance Latency Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-gray-900/80 p-3.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm font-medium gap-2">
                <div className="space-y-1 sm:space-y-0 sm:space-x-4">
                  <span className="text-gray-800 dark:text-gray-200">
                    Active Specialties:{' '}
                    <strong className="text-blue-600 dark:text-blue-400 font-bold">
                      {result.activeSpecialties?.join(', ') || 'None (>0.7)'}
                    </strong>
                  </span>
                  {result.searchTerm && (
                    <span className="text-gray-700 dark:text-gray-300">
                      Search Query:{' '}
                      <code className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded text-xs font-mono font-semibold">
                        {result.searchTerm}
                      </code>
                    </span>
                  )}
                </div>
                <span className="text-blue-600 dark:text-blue-400 font-bold self-start sm:self-auto">
                  ⚡ {result.latencyMs ?? 0} ms total
                </span>
              </div>

              {/* 1. Pass 1 Router Scores */}
              {result.routerScores && Object.keys(result.routerScores).length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Pass 1: Universal Router Confidence
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(result.routerScores).map(([key, score]) => {
                      const isActive = score > 0.7;
                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-md border text-xs transition-colors ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 font-semibold text-blue-950 dark:text-blue-200 shadow-xs'
                              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-xs">{key}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {(score * 100).toFixed(0)}%
                            </span>
                          </div>
                          {isActive && (
                            <span className="text-[11px] text-blue-700 dark:text-blue-400 font-bold mt-1 block">
                              ✓ Triggered (&gt; 0.70)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 2. Jev Extracted Entries Table */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Pass 2: Specialty Extracted Entities
                </h2>
                {result.extractedEntities &&
                Object.keys(result.extractedEntities).length > 0 ? (
                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-xs">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-bold text-gray-800 dark:text-gray-200">
                            Entity Field
                          </th>
                          <th className="px-4 py-2.5 text-left font-bold text-gray-800 dark:text-gray-200">
                            Extracted Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                        {Object.entries(result.extractedEntities).map(
                          ([key, val]) => (
                            <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                              <td className="px-4 py-2.5 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {key}
                              </td>
                              <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100 font-medium">
                                {String(val)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No entities extracted.</p>
                )}
              </section>

              {/* 3. Local ICD-API Lookups Table */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Pass 3: Post-Coordinated ICD-11 Codes
                  </h2>
                  <span className="text-xs px-2.5 py-1 bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 rounded font-semibold">
                    Status: {result.icdStatusMessage}
                  </span>
                </div>

                {result.icdCandidates && result.icdCandidates.length > 0 ? (
                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-xs">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-bold text-gray-800 dark:text-gray-200">
                            Post-Coordinated Code
                          </th>
                          <th className="px-4 py-2.5 text-left font-bold text-gray-800 dark:text-gray-200">
                            Title / Concept
                          </th>
                          <th className="px-4 py-2.5 text-left font-bold text-gray-800 dark:text-gray-200">
                            Extensions
                          </th>
                          <th className="px-4 py-2.5 text-left font-bold text-gray-800 dark:text-gray-200">
                            Score
                          </th>
                          <th className="px-4 py-2.5 text-left font-bold text-gray-800 dark:text-gray-200">
                            Matched Synonyms
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                        {result.icdCandidates.map((candidate, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 align-top">
                            <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400 text-base">
                              {candidate.theCode || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {stripHtml(candidate.title)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Base:{' '}
                                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">
                                  {candidate.baseCode || candidate.theCode}
                                </code>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                              {candidate.extensionCodes && candidate.extensionCodes.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {candidate.extensionCodes.map((ext, extIdx) => (
                                    <span
                                      key={extIdx}
                                      className="inline-block bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 rounded font-semibold"
                                    >
                                      &amp;{ext}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">None</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {typeof candidate.score === 'number'
                                ? candidate.score.toFixed(3)
                                : 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              {candidate.matchingPVs &&
                              candidate.matchingPVs.length > 0 ? (
                                <ul className="space-y-1.5 text-xs">
                                  {candidate.matchingPVs.map((pv, pvIdx) => (
                                    <li
                                      key={pvIdx}
                                      className="p-2 bg-gray-50 dark:bg-gray-800/80 rounded border border-gray-200 dark:border-gray-700"
                                    >
                                      <div className="font-medium text-gray-800 dark:text-gray-200">
                                        • {stripHtml(pv.label)}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No matching candidate codes returned.
                  </p>
                )}
              </section>

              {/* 4. Raw JSON Presentations */}
              <section className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-md font-bold text-gray-900 dark:text-gray-100">
                  Raw JSON Data Outputs
                </h3>

                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Extracted Entities JSON
                  </h4>
                  <pre className="p-3 bg-gray-900 dark:bg-black text-green-400 text-xs rounded-md overflow-x-auto font-mono border border-gray-800">
                    {JSON.stringify(result.extractedEntities, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    ICD-11 Candidates JSON
                  </h4>
                  <pre className="p-3 bg-gray-900 dark:bg-black text-green-400 text-xs rounded-md overflow-x-auto font-mono max-h-96 border border-gray-800">
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
