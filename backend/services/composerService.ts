import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

/* ------------------------------------------------------------------ */
/*  Preset definitions                                                 */
/* ------------------------------------------------------------------ */

export interface ComposerPreset {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export const PRESETS: ComposerPreset[] = [
  {
    id: 'accessibility',
    name: 'Accessibility Description',
    description: 'Generates an accessibility-friendly narration suitable for screen readers and visually impaired users.',
    systemPrompt: `You are an accessibility specialist. Given a sequence of frame-by-frame descriptions of a video, write a clear, sequential, accessibility-friendly narration of the entire video. The narration should:
- Be suitable for screen readers and visually impaired users
- Describe visual elements, actions, scene transitions, and on-screen text
- Use present tense and vivid but concise language
- Flow naturally as a single coherent narrative
- Include timing cues where helpful (e.g. "The video begins with...", "Midway through...")`,
  },
  {
    id: 'summary',
    name: 'Content Summary',
    description: 'Creates a concise executive summary of the video\'s key content, topics, and takeaways.',
    systemPrompt: `You are a content analyst. Given a sequence of frame-by-frame descriptions of a video, write a concise executive summary. The summary should:
- Highlight the main topics, events, and key moments
- Be structured with a brief overview followed by key points
- Note any important text, people, or objects that appear
- Be suitable for someone deciding whether to watch the full video
- Keep it concise (2-4 paragraphs)`,
  },
  {
    id: 'chapters',
    name: 'Chapter Markers',
    description: 'Generates timestamped chapter markers with descriptions for easy video navigation.',
    systemPrompt: `You are a video editor. Given a sequence of frame-by-frame descriptions of a video with their timestamps, generate chapter markers. For each chapter:
- Provide a timestamp (use the frame timestamps as reference)
- Give a short, descriptive title (3-8 words)
- Add a one-sentence description of what happens in that segment
- Group related frames into logical chapters
- Format each chapter as: "[timestamp] Title — Description"
- Aim for a reasonable number of chapters (not one per frame)`,
  },
];

/* ------------------------------------------------------------------ */
/*  Compose function                                                   */
/* ------------------------------------------------------------------ */

const COMPOSER_MODEL = 'gpt-5-nano';

export async function composeFromFrames(
  presetId: string,
  frames: Array<{ frameNumber: number; timestamp: number; description: string }>,
  videoName: string,
): Promise<string> {
  const preset = PRESETS.find(p => p.id === presetId);
  if (!preset) throw new Error(`Unknown preset: ${presetId}`);
  if (!frames.length) throw new Error('No frame descriptions available to compose from.');

  // Build the user message from frame data
  const frameText = frames
    .map(f => `[Frame ${f.frameNumber} @ ${f.timestamp.toFixed(2)}s]: ${f.description}`)
    .join('\n');

  const userMessage = `Video: "${videoName}"\n\nFrame descriptions (${frames.length} total):\n\n${frameText}`;

  const response = await openai.chat.completions.create({
    model: COMPOSER_MODEL,
    messages: [
      { role: 'system', content: preset.systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? '';
}
