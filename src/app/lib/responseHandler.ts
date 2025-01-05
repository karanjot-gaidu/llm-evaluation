// responseHandler.ts
import Groq from 'groq-sdk';

interface ModelResponse {
  model: string;
  answer: string;
}

interface EvaluationResponse {
  Accuracy: number;
  Clarity: number;
  Relevancy: number;
}

// Initialize Groq client
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

export async function handleTestCases(systemRole: string, testCases: any[]): Promise<{ modelResponses: ModelResponse[][]; modelEvaluations: string[][] }> {
  const modelResponses: ModelResponse[][] = [];
  const modelEvaluations: string[][] = [];

  for (const testCase of testCases) {
    const modelResponsesForTestCase: ModelResponse[] = [];
    const modelEvaluationsForTestCase: string[] = [];

    const modelsToUse = ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'];

    for (const model of modelsToUse) {
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemRole },
          { role: 'user', content: `Please generate an answer for the following test case: ${testCase.input}` },
        ],
        model: model,
      });

      const answer = response.choices[0].message.content ?? '';
      modelResponsesForTestCase.push({ model, answer });

      const evaluation = await groq.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: `You are an evaluator that checks answers based on the following criteria: Accuracy, Clarity, Relevancy. Only return the answer in JSON format: {Accuracy: x, Clarity: y, Relevancy: z} with x,y,z being a number between 0 to 1 depending on the evaluation. Do not include any other text` 
          },
          { 
            role: 'user', 
            content: `Generated Answer: ${answer}\n\nReference Answer: ${testCase.referenceAnswer}` 
          },
        ],
        model: 'llama-3.3-70b-versatile',
      });

      const evaluationResult = evaluation.choices[0].message.content ?? '';
      modelEvaluationsForTestCase.push(evaluationResult);
    }

    modelResponses.push(modelResponsesForTestCase);
    modelEvaluations.push(modelEvaluationsForTestCase);
  }

  return { modelResponses, modelEvaluations };
}
