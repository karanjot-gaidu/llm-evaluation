"use client";
import { useState, useEffect } from 'react';
// import testCard from './components/ui/testCard';

interface TestCase {
  input: string;
  referenceAnswer: string;
}

interface EvaluationResponse {
  Accuracy: number;
  Clarity: number;
  Relevancy: number;
}

interface ModelResponse {
  model: string; 
  answer: string;
}

export default function Home() {
  const [systemRole, setSystemRole] = useState<string>('');
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', referenceAnswer: '' }, // Example test case
  ]);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResponse[][]>([]); 
  const [generatedResults, setGeneratedResults] = useState<ModelResponse[][]>([]); 
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', referenceAnswer: '' }]);
  };

  const evaluateTestCases = async () => {
    setLoading(true);
    setEvaluationResults([]);
    setGeneratedResults([]); 

    try {
      const response = await fetch("/api/evaluate", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemRole, testCases }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEvaluationResults(data.modelEvaluations || []); 
      setGeneratedResults(data.modelResponses || []); 
    } catch (error: unknown) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      // setEvaluationResults([`Failed to evaluate the test cases: ${errorMessage}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side */}
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold text-white">LLM Eval</a>
            </div>
            {/* Right side */}
            <div className="flex space-x-4">
              <a href="#" className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
                Show All Experiments
              </a>
              <a href="#" className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
                Create New Experiment
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">LLM Evaluation App</h1>

        {/* System Role Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">System Role:</label>
          <textarea
            value={systemRole}
            onChange={(e) => setSystemRole(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* Test Cases Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Test Cases</h3>
          <div className="space-y-6">
            {testCases?.map((testCase, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Input:</label>
                  <input
                    type="text"
                    value={testCase.input || ''}
                    onChange={(e) =>
                      setTestCases([
                        ...testCases.slice(0, index),
                        { ...testCase, input: e.target.value },
                        ...testCases.slice(index + 1),
                      ])
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Answer:</label>
                  <input
                    type="text"
                    value={testCase.referenceAnswer || ''}
                    onChange={(e) =>
                      setTestCases([
                        ...testCases.slice(0, index),
                        { ...testCase, referenceAnswer: e.target.value },
                        ...testCases.slice(index + 1),
                      ])
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 space-x-4">
            <button
              onClick={handleAddTestCase}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Test Case
            </button>
            <button
              onClick={evaluateTestCases}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Evaluating...' : 'Evaluate Test Cases'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {generatedResults?.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Generated Results</h3>
            <div className="space-y-6">
              {generatedResults.map((modelAnswers, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Test Case {index + 1}</h4>
                  <ul className="space-y-2">
                    {modelAnswers?.map((answer, modelIndex) => (
                      <li key={modelIndex} className="text-gray-700">
                        <span className="font-medium">Model {modelIndex + 1}:</span> {answer?.answer || 'No answer provided'}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evaluation Results Section */}
        {evaluationResults?.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Evaluation Results</h3>
            <div className="space-y-6">
              {evaluationResults.map((modelEvaluations, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Test Case {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modelEvaluations?.map((evaluation, modelIndex) => (
                      <div key={modelIndex} className="bg-white p-4 rounded-md shadow">
                        <h5 className="font-medium text-gray-900 mb-2">Model {modelIndex + 1}</h5>
                        <ul className="space-y-1">
                          <li className="text-sm text-gray-700">
                            <span className="font-medium">Accuracy:</span> {evaluation?.Accuracy || 'N/A'}
                          </li>
                          <li className="text-sm text-gray-700">
                            <span className="font-medium">Clarity:</span> {evaluation?.Clarity || 'N/A'}
                          </li>
                          <li className="text-sm text-gray-700">
                            <span className="font-medium">Relevancy:</span> {evaluation?.Relevancy || 'N/A'}
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}