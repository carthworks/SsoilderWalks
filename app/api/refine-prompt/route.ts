import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { idea, style = 'cinematic strategy game' } = await req.json();

    const ai = getGeminiClient();
    const promptText = `You are an expert cinematic director and historical strategy game visual artist. The user wants to generate a short seamless video using Veo 3.1.
User idea: "${idea || 'Historical soldier and horse walking loop with parallax scrolling'}"
Style: "${style}"

Provide a concise, vivid, camera-directed video generation prompt (under 60 words) that describes:
1. The subject: Ancient warrior soldier (armor, cape, weapon, banner) walking beside a majestic white war horse
2. Setting: Ancient temple mountain ridge, waterfalls, mist, golden light, historical empire
3. Motion: Continuous slow walking loop, side-scrolling parallax camera motion, wind in flags and mane
4. Atmosphere: Calm, epic, seamless looping background.

Respond ONLY with the final prompt text, no quotes, no markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
    });

    return NextResponse.json({ refinedPrompt: response.text?.trim() });
  } catch (error: any) {
    console.error('refine-prompt error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to refine prompt' },
      { status: 500 }
    );
  }
}
