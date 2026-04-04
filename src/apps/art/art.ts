import { redactPiiSimple } from '../../shared/pii';
import { runAgentCompletions, type ConversationInput } from '../../shared/mistral';
import { stripMarkdown } from '../../shared/format';
import { RagService } from '../../shared/rag';
import { getEnv } from '../../env';

export const artRag = new RagService({
  indexPath: 'data/art/rag-index.json',
  documentsDir: 'documents/art',
});

export type ArtPreferences = {
  style?: string | null;
  medium?: string | null;
  skill_level?: string | null;
  focus?: string | null;
};

function buildPreferenceContext(preferences?: ArtPreferences | null): string {
  if (!preferences) return '';

  const lines: string[] = [
    'USER PREFERENCES (apply to this and all subsequent responses):',
  ];

  if (preferences.style) {
    lines.push(
      `- Artistic Style: Prioritize ${preferences.style} aesthetics and historical references.`,
    );
  }
  if (preferences.medium) {
    lines.push(
      `- Medium Focus: Tailor all technical advice specifically to ${preferences.medium}.`,
    );
  }
  if (preferences.skill_level) {
    const level = preferences.skill_level.toLowerCase();
    if (level === 'beginner') {
      lines.push(
        '- Skill Level: Use accessible language; avoid jargon; explain fundamentals first.',
      );
    } else if (level === 'intermediate') {
      lines.push(
        '- Skill Level: Assume foundational knowledge; introduce nuanced techniques.',
      );
    } else if (level === 'advanced') {
      lines.push(
        '- Skill Level: Use professional terminology; focus on refinement and mastery.',
      );
    } else {
      lines.push(
        `- Skill Level: Calibrate for a ${preferences.skill_level} practitioner.`,
      );
    }
  }
  if (preferences.focus) {
    lines.push(
      `- Topic Focus: Emphasize ${preferences.focus} in both conceptual and technical guidance.`,
    );
  }

  return lines.length > 1 ? lines.join('\n') : '';
}

export async function handleArtChat(
  message: string,
  history: ConversationInput[],
  preferences?: ArtPreferences | null,
): Promise<{ reply: string; metadata: { status: string } }> {
  const env = getEnv();

  const artContext = await artRag.getContext(message);
  const augmentedInput = artContext
    ? `[Retrieved Reference Material]\n${artContext}\n\n[User Message]\n${message}`
    : message;

  const safeInput = redactPiiSimple(augmentedInput);
  const preferenceContext = buildPreferenceContext(preferences);
  const userContent = preferenceContext
    ? `${preferenceContext}\n\n${safeInput}`
    : safeInput;

  const inputs: ConversationInput[] = [
    ...history,
    { role: 'user', content: userContent },
  ];

  const reply = await runAgentCompletions(env.artAgentId, inputs);

  return {
    reply: stripMarkdown(reply),
    metadata: { status: 'success' },
  };
}
