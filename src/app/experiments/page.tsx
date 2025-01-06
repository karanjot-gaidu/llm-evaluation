"use client";
import { useState, useEffect } from 'react';
import { groupExperimentData } from '../lib/allExperiments';
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

type Evaluation = {
  model_name: string;
  accuracy: string;
  clarity: string;
  relevancy: string;
  created_at: string;
};

type TestCase = {
  test_id: string;
  test_case: string;
  reference_answer: string;
  evaluations: Evaluation[];
};

type Experiment = {
  experiment_id: string;
  experiment_name: string;
  system_prompt: string;
  created_at: string;
  test_cases: Record<string, TestCase> | null;
};

interface OpenTestCases {
  [key: string]: boolean;
}

export default function ExperimentsPage() {
  const [experimentsData, setExperimentsData] = useState<Experiment[] | null>(null);
  const [openTestCases, setOpenTestCases] = useState<OpenTestCases>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get-experiments');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const groupedData = await groupExperimentData(data);

        // Ensure grouped data is converted to an array
        setExperimentsData(Object.values(groupedData));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  if (!experimentsData) {
    return <div>Loading...</div>;
  }

  const toggleTestCase = (testId: string): void => {
    setOpenTestCases((prev: OpenTestCases) => ({
      ...prev,
      [testId]: !prev?.[testId] || false,
    }));
  };

  return (
    <div className="w-full min-h-screen font-fira">
      <nav className="bg-gray-800 fixed top-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold text-white">LLM Eval</a>
            </div>
            <div className="flex space-x-4">
              <Link href="/../" legacyBehavior>
                <a className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
                  Go Back
                </a>
              </Link>
              <a href="/.." onClick={() => (window.location.href = window.location.href)} className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
                Create New Experiment
              </a>
            </div>
          </div>
        </div>
      </nav>
      <div className='w-full max-w-6xl mx-auto p-6 space-y-6'>
      <h1 className="text-3xl font-bold mb-6 mt-20">All Experiments</h1>
      
      <div className="space-y-4">
        {experimentsData.map((experiment) => (
          <Card key={experiment.experiment_id}>
            <CardHeader>
              <CardTitle>{experiment.experiment_name}</CardTitle>
              <p className="text-sm text-gray-500">Created At: {experiment.created_at}</p>
              <div className='text-md text-gray-900 pt-3'><strong>System Prompt: </strong>{experiment.system_prompt}</div>
            </CardHeader>
            <CardContent>
              {experiment.test_cases ? (
                <div className="space-y-4">
                  {Object.values(experiment.test_cases).map((testCase) => (
                    <div key={testCase.test_id} className="border rounded-lg">
                      <button
                        onClick={() => toggleTestCase(testCase.test_id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                      >
                        <span className="text-lg font-medium">Test Case: {testCase.test_case}</span>
                        {openTestCases?.[testCase.test_id] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      
                      {openTestCases?.[testCase.test_id] && (
                        <div className="p-4 border-t">
                          <div className="pl-4 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-medium">Reference Answer:</p>
                              <p className="mt-2">{testCase.reference_answer}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {testCase.evaluations.map((evaluation) => (
                                <Card
                                  key={`${testCase.test_id}-${evaluation.model_name}`}
                                  className="bg-white"
                                >
                                  <CardHeader>
                                    <CardTitle className="text-lg">{evaluation.model_name}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Accuracy:</span>
                                        <span className="font-medium">{evaluation.accuracy}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Clarity:</span>
                                        <span className="font-medium">{evaluation.clarity}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Relevancy:</span>
                                        <span className="font-medium">{evaluation.relevancy}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="text-sm">{evaluation.created_at}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No test cases available</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </div>
  );
}
