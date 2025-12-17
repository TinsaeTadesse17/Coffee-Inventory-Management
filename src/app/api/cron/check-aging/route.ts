import { NextRequest, NextResponse } from 'next/server';
import { checkAgingCoffee } from '@/lib/aging-check';

/**
 * Cron endpoint to check for aging coffee
 * This should be called daily via a cron job service like Vercel Cron or similar
 * 
 * To secure this endpoint, you can:
 * 1. Use Vercel Cron's authentication
 * 2. Add a secret token in headers
 * 3. Restrict to internal/localhost calls only
 */
export async function GET(req: NextRequest) {
  try {
    // Optional: Add authentication
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await checkAgingCoffee();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in aging check cron:', error);
    return NextResponse.json(
      { error: 'Failed to check aging coffee' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to manually trigger aging check
 * Requires admin authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Add auth check here if needed
    const result = await checkAgingCoffee();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in manual aging check:', error);
    return NextResponse.json(
      { error: 'Failed to check aging coffee' },
      { status: 500 }
    );
  }
}







