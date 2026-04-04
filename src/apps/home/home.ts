import { sanitizeChatMessage } from '../../shared/sanitize';
import { redactPiiSimple } from '../../shared/pii';
import { runAgentConversation, type ConversationInput } from '../../shared/mistral';
import { stripMarkdown } from '../../shared/format';
import { RagService } from '../../shared/rag';
import { getEnv } from '../../env';

export const homeRag = new RagService({
  indexPath: 'data/home/rag-index.json',
  documentsDir: 'documents/home',
});

export async function handleHomeChat(
  message: string,
  history: ConversationInput[],
): Promise<{ reply: string; metadata: { status: string } }> {
  const env = getEnv();
  const safeMessage = redactPiiSimple(sanitizeChatMessage(message));

  const context = await homeRag.getContext(safeMessage);
  const userContent = context
    ? `[Portfolio Context]\n${context}\n\n[User Message]\n${safeMessage}`
    : safeMessage;

  const inputs: ConversationInput[] = [
    ...history,
    { role: 'user', content: userContent },
  ];

  const rawReply = await runAgentConversation(env.homeAgentId, inputs);

  return {
    reply: stripMarkdown(rawReply || 'No response received.'),
    metadata: { status: 'success' },
  };
}
