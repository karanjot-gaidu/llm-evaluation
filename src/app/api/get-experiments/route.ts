import { fetchAllExperimentData } from '@/app/utils/db.queries';
import { NextResponse } from 'next/server';

// Handle GET requests
export async function GET() {
  try {
    const experimentsData = await fetchAllExperimentData();
    return NextResponse.json(experimentsData, { status: 200 });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiments' },
      { status: 500 }
    );
  }
}
