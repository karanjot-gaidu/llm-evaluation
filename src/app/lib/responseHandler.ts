// responseHandler.ts
import Groq from 'groq-sdk';
import { genAI } from './gemini-settings';

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

export async function handleTestCases(systemRole: string, testCases: any[]): Promise<{ modelResponses: ModelResponse[][]; modelEvaluations: EvaluationResponse[][] }> {
  const modelResponses: ModelResponse[][] = [];
  const modelEvaluations: EvaluationResponse[][] = [];

  for (const testCase of testCases) {
    const modelResponsesForTestCase: ModelResponse[] = [];
    const modelEvaluationsForTestCase: EvaluationResponse[] = [];

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

    //   const evaluation = await groq.chat.completions.create({
    //     messages: [
    //       { 
    //         role: 'system', 
    //         content: `You are an evaluator that checks answers based on the following criteria: Accuracy, Clarity, Relevancy. Only return the answer in JSON format: {Accuracy: x, Clarity: y, Relevancy: z} with x,y,z being a number between 0 to 1 depending on the evaluation. Do not include any other text` 
    //       },
    //       { 
    //         role: 'user', 
    //         content: `Generated Answer: ${answer}\n\nReference Answer: ${testCase.referenceAnswer}` 
    //       },
    //     ],
    //     model: 'llama-3.3-70b-versatile',
    //   });

      const evalModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "You are an evaluator that checks answers based on the following criteria: Accuracy, Clarity, Relevancy. Only return the answer in JSON format: {Accuracy: x, Clarity: y, Relevancy: z} with x,y,z being a number between 0 to 1 depending on the evaluation. Do not include any other text."
    })

      const evalPrompt = "Generated Answer: ${answer}\n\nReference Answer: ${testCase.referenceAnswer}";

      const evaluation = await evalModel.generateContent(evalPrompt);
      let content = evaluation.response.text();

      content = content
        .replace(/```[a-zA-z]*\n?/g, '') // Remove ```json or any other language identifier
        .replace(/```/g, '')          // Remove remaining backticks
        .replace(/\n/g, '')           // Remove newlines
        .trim();                      // Remove whitespace
      
        const jsonMatch = content.match(/\{.*\}/);
        let evaluationObject: EvaluationResponse | null = null;

        if (jsonMatch) {
            try {
                const parsedObject = JSON.parse(jsonMatch[0]);

                // Validate structure explicitly
                if (
                    typeof parsedObject.Accuracy === 'number' &&
                    typeof parsedObject.Clarity === 'number' &&
                    typeof parsedObject.Relevancy === 'number'
                ) {
                    evaluationObject = parsedObject;
                } else {
                    console.warn('Parsed evaluation object does not match expected structure:', parsedObject);
                }
            } catch (error) {
                console.error('Failed to parse evaluation JSON:', error, content);
            }
        }

        // Push only if evaluationObject is not null
        if (evaluationObject) {
            modelEvaluationsForTestCase.push(evaluationObject);
        } else {
            console.warn('Evaluation object is null, pushing default values');
            modelEvaluationsForTestCase.push({ Accuracy: 0, Clarity: 0, Relevancy: 0 });
        }

    }

    modelResponses.push(modelResponsesForTestCase);
    modelEvaluations.push(modelEvaluationsForTestCase);
  }

  return { modelResponses, modelEvaluations };
}
