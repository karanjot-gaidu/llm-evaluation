// 

// route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import { handleTestCases } from '@/app/lib/responseHandler';

export async function POST(req: Request, res: NextApiResponse) {
  try {
    const requestBody = await req.json();
    const { systemRole, testCases } = requestBody;

    if (!testCases || testCases.length === 0) {
      return NextResponse.json({ error: 'No test cases provided' }, { status: 400 });
    }

    // Delegate the logic to responseHandler
    const { modelResponses, modelEvaluations } = await handleTestCases(systemRole, testCases);

    return NextResponse.json({ modelResponses, modelEvaluations });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to communicate with Groq API' });
  }
}
