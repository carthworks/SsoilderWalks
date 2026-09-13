import { NextRequest, NextResponse } from 'next/server';
import { GenerateVideosOperation } from '@google/genai';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { operationName } = body;

    if (!operationName) {
      return NextResponse.json(
        { error: 'operationName is required' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (!updated.done) {
      return NextResponse.json(
        { error: 'Video generation is still processing.' },
        { status: 400 }
      );
    }

    if (updated.error) {
      return NextResponse.json(
        { error: `Video generation failed: ${JSON.stringify(updated.error)}` },
        { status: 500 }
      );
    }

    const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      return NextResponse.json(
        { error: 'No video URI returned from generation operation.' },
        { status: 404 }
      );
    }

    const videoRes = await fetch(videoUri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoRes.ok) {
      return NextResponse.json(
        { error: `Failed to download video stream (${videoRes.status})` },
        { status: videoRes.status }
      );
    }

    return new Response(videoRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'inline; filename="historical_strategy_soldier_horse_loop.mp4"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('video-download error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to download video' },
      { status: 500 }
    );
  }
}
