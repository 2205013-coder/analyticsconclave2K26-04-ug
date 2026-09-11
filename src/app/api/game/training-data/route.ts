import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedTrainingData: any[] | null = null;
let cacheTime = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const venueType = searchParams.get('venueType');
    const concertDay = searchParams.get('concertDay');
    const weather = searchParams.get('weather');

    if (!cachedTrainingData || Date.now() - cacheTime > 60000) {
      cachedTrainingData = await prisma.trainingMatch.findMany();
      cacheTime = Date.now();
    }

    let filteredData = cachedTrainingData;

    if (genre) {
      filteredData = filteredData.filter((d) => d.genre.toLowerCase() === genre.toLowerCase());
    }
    if (venueType) {
      filteredData = filteredData.filter((d) => d.venueType.toLowerCase() === venueType.toLowerCase());
    }
    if (concertDay) {
      filteredData = filteredData.filter((d) => d.concertDay.toLowerCase() === concertDay.toLowerCase());
    }
    if (weather) {
      filteredData = filteredData.filter((d) => d.weather.toLowerCase() === weather.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
    console.error('Training data error:', error);
    return NextResponse.json({ error: 'Failed to fetch training data' }, { status: 500 });
  }
}
