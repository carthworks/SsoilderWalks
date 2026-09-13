import { NextRequest, NextResponse } from 'next/server';
import { GenerateVideosOperation } from '@google/genai';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
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

    return NextResponse.json({
      done: Boolean(updated.done),
      error: updated.error || null,
    });
  } catch (error: any) {
    console.error('video-status error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to check operation status' },
      { status: 500 }
    );
  }
}
