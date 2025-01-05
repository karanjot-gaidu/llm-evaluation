import React from 'react';
import { Loader2 } from 'lucide-react';

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

interface ResultsSectionProps {
  loading: boolean;
  generatedResults: ModelResponse[][];
  evaluationResults: EvaluationResponse[][];
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ 
    loading, 
    generatedResults, 
    evaluationResults 
  }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      );
    }
  
    if (!generatedResults?.length) return null;
  
    return (
      <div className="space-y-6">
        {generatedResults.map((modelAnswers, testIndex) => (
          <div key={testIndex} className="bg-white rounded-lg shadow p-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Test Case {testIndex + 1}</h4>
            
            {/* Grid for side-by-side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model responses container with equal heights */}
              <div className="grid grid-cols-2 gap-6 md:col-span-2">
                {/* Model 1 */}
                <div className="flex flex-col h-full">
                  <div className="bg-gray-50 p-4 rounded-md flex-grow">
                    <h5 className="font-bold text-gray-900 mb-2">Llama 3.3</h5>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {modelAnswers[0]?.answer || 'No answer provided'}
                    </p>
                  </div>
                  
                  {evaluationResults[testIndex] && (
                    <div className="bg-blue-50 p-4 rounded-md mt-4">
                      <h6 className="font-bold text-gray-900 mb-2">Gemini Evaluation</h6>
                      <ul className="space-y-1">
                        <li className="text-sm text-gray-700">
                          <span className="font-medium">Accuracy:</span> {evaluationResults[testIndex][0]?.Accuracy || 'N/A'}
                        </li>
                        <li className="text-sm text-gray-700">
                          <span className="font-medium">Clarity:</span> {evaluationResults[testIndex][0]?.Clarity || 'N/A'}
                        </li>
                        <li className="text-sm text-gray-700">
                          <span className="font-medium">Relevancy:</span> {evaluationResults[testIndex][0]?.Relevancy || 'N/A'}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
  
                {/* Model 2 */}
                <div className="flex flex-col h-full">
                  <div className="bg-gray-50 p-4 rounded-md flex-grow">
                    <h5 className="font-bold text-gray-900 mb-2">Mixtral</h5>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {modelAnswers[1]?.answer || 'No answer provided'}
                    </p>
                  </div>
                  
                  {evaluationResults[testIndex] && (
                    <div className="bg-green-50 p-4 rounded-md mt-4">
                      <h6 className="font-bold text-gray-900 mb-2">Gemini Evaluation</h6>
                      <ul className="space-y-1">
                        <li className="text-sm text-gray-700">
                          <span className="font-medium">Accuracy:</span> {evaluationResults[testIndex][1]?.Accuracy || 'N/A'}
                        </li>
                        <li className="text-sm text-gray-700">
                          <span className="font-medium">Clarity:</span> {evaluationResults[testIndex][1]?.Clarity || 'N/A'}
                        </li>
                        <li className="text-sm text-gray-700">
                          <span className="font-medium">Relevancy:</span> {evaluationResults[testIndex][1]?.Relevancy || 'N/A'}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };