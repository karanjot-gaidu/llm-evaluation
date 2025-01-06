"use client";
import { useState, useEffect } from 'react';
import {Loader2} from 'lucide-react';
import { ResultsSection } from './components/ui/results';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

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

  const router = useRouter();
  const handleViewAllExperiments = async () => {
    // router.push('/experiments');
  }

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
    <div className="min-h-screen bg-gray-50 font-fira">
      {/* Navigation */}
      <nav className="bg-gray-800 fixed top-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold text-white">LLM Eval</a>
            </div>
            <div className="flex space-x-4">
              <Link href="/experiments" legacyBehavior>
                <a className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
                  Show All Experiments
                </a>
              </Link>
              <a href="#" onClick={() => (window.location.href = window.location.href)} className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
                Create New Experiment
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mt-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {/* System Role Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Experiment</h3>
          <label className="block text-sm font-medium text-gray-700 mb-2">System Role:</label>
          <textarea
            value={systemRole}
            onChange={(e) => setSystemRole(e.target.value)}
            className="w-full rounded-md border-b-2 p-2 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-blue-2"
            rows={2}
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
                    suppressHydrationWarning
                    onChange={(e) =>
                      setTestCases([
                        ...testCases.slice(0, index),
                        { ...testCase, input: e.target.value },
                        ...testCases.slice(index + 1),
                      ])
                    }
                    className="w-full rounded-md border-b-2 shadow-sm p-2 focus:outline-none focus:border-blue-400 focus:ring-blue-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Answer:</label>
                  <input
                    type="text"
                    value={testCase.referenceAnswer || ''}
                    suppressHydrationWarning
                    onChange={(e) =>
                      setTestCases([
                        ...testCases.slice(0, index),
                        { ...testCase, referenceAnswer: e.target.value },
                        ...testCases.slice(index + 1),
                      ])
                    }
                    className="w-full rounded-md border-b-2 shadow-sm p-2 focus:outline-none focus:border-blue-400 focus:ring-blue-2"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 space-x-4">
            <button
              onClick={handleAddTestCase}
              suppressHydrationWarning
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Test Case
            </button>
            <button
              onClick={evaluateTestCases}
              disabled={loading}
              suppressHydrationWarning
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Evaluating...' : 'Evaluate Test Cases'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <ResultsSection 
          loading={loading}
          generatedResults={generatedResults}
          evaluationResults={evaluationResults}
        />
      </main>
    </div>


  );
}