import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      imageBase64,
      imageMimeType = 'image/png',
      aspectRatio = '16:9',
      model = 'veo-3.1-fast-generate-preview',
    } = body;

    const ai = getGeminiClient();

    const videoConfig: {
      numberOfVideos: number;
      resolution: '720p' | '1080p';
      aspectRatio: '16:9' | '9:16';
    } = {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
    };

    const payload: {
      model: string;
      prompt?: string;
      image?: {
        imageBytes: string;
        mimeType: string;
      };
      config: typeof videoConfig;
    } = {
      model: model || 'veo-3.1-fast-generate-preview',
      prompt:
        prompt ||
        'Cinematic historical strategy game endless walking loop: a heroic ancient Tamil warrior soldier walks side-by-side with an elegant white war horse, carrying royal tiger banner, along a mountain crest overlooking ancient temples, waterfalls, and mist at golden hour. Smooth continuous walk gait, seamless loop motion.',
      config: videoConfig,
    };

    if (imageBase64) {
      // Clean base64 prefix if provided (e.g. data:image/png;base64,...)
      const cleanedBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      payload.image = {
        imageBytes: cleanedBase64,
        mimeType: imageMimeType || 'image/png',
      };
    }

    const operation = await ai.models.generateVideos(payload);

    return NextResponse.json({
      operationName: operation.name,
      modelUsed: payload.model,
    });
  } catch (error: any) {
    console.error('generate-video error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initiate video generation' },
      { status: 500 }
    );
  }
}
