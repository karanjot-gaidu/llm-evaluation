"use client";
import { useState } from 'react';

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
    <div style={{ padding: '2rem' }}>
      <h1>LLM Evaluation App</h1> 
      <label>System Role:</label>
      <textarea value={systemRole} onChange={(e) => setSystemRole(e.target.value)} />
      <br />
      <h3>Test Cases</h3>
      {testCases.map((testCase, index) => (
        <div key={index}>
          <label>Input:</label>
          <input
            type="text"
            value={testCase.input}
            onChange={(e) =>
              setTestCases([
                ...testCases.slice(0, index),
                { ...testCase, input: e.target.value },
                ...testCases.slice(index + 1),
              ])
            }
          />
          <br />
          <label>Reference Answer:</label>
          <input
            type="text"
            value={testCase.referenceAnswer}
            onChange={(e) =>
              setTestCases([
                ...testCases.slice(0, index),
                { ...testCase, referenceAnswer: e.target.value },
                ...testCases.slice(index + 1),
              ])
            }
          />
          <br />
        </div>
      ))}
      <button onClick={handleAddTestCase}>Add Test Case</button>
      <br />

      <button onClick={evaluateTestCases} disabled={loading}>
        {loading ? 'Evaluating...' : 'Evaluate Test Cases'}
      </button>
      <h3>Generated Results</h3>
      {generatedResults.map((modelAnswers, index) => ( 
        <div key={index}>
          <h4>Test Case {index + 1}</h4>
          <ul>
            {modelAnswers.map((answer, modelIndex) => (
              <li key={modelIndex}>
                **Model {modelIndex + 1}:** {answer.answer} 
              </li>
            ))}
          </ul>
        </div>
      ))}
      <h3>Evaluation Results</h3>
      {evaluationResults.map((modelEvaluations, index) => ( 
        <div key={index}>
          <h4>Test Case {index + 1}</h4>
          <ul>
            {modelEvaluations.map((evaluation, modelIndex) => (
              <li key={modelIndex}>
                **Model {modelIndex + 1}:** 
                <ul>
                  <li><strong>Accuracy:</strong> {evaluation.Accuracy}</li>
                  <li><strong>Clarity:</strong> {evaluation.Clarity}</li>
                  <li><strong>Relevancy:</strong> {evaluation.Relevancy}</li>
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}