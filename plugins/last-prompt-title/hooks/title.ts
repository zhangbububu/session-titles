const MAX_LENGTH = 60
const MAX_PROMPT_CHARS = 1000
const MAX_EARLIER_CHARS = 300

/** How many of the user's previous prompts go with the latest one, to resolve what a follow-up is about. */
export const EARLIER_PROMPTS = 3

/** One line of at most MAX_LENGTH characters from a prompt, or undefined if it holds no title. */
export function titleFrom(prompt: string): string | undefined {
  const text = prompt.replace(/\s+/g, ' ').trim()
  if (text === '' || text.startsWith('/')) return undefined
  return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH - 1).trimEnd()}…` : text
}

const SYSTEM =
  'You name chat sessions from the user\'s latest <message>. Any <earlier> messages are the user\'s previous ' +
  'messages in the same session: use them only to tell what a short follow-up ("explain", "解释", "继续", "why?") ' +
  'refers to; title the latest message, not the earlier ones. ' +
  'Name the concrete subject: the function, identifier, file, feature, error or task at hand, e.g. ' +
  '"AgentManager.start 去重逻辑", "agent:start 启动流程", "Fix login redirect loop". ' +
  'Never reply with a generic label that could title any session, such as "代码解释", "代码分析", "问题咨询", ' +
  '"Code explanation", "Bug fix" or "Question". ' +
  'Reply with the title only: at most 8 words, or about 20 characters in Chinese (code identifiers may stay whole), ' +
  'in the language of the latest message, no quotes, no trailing punctuation.'

/** The completion that asks a model to title a session from the user's latest prompt and the few before it. */
export function titleRequest(prompt: string, earlier: readonly string[] = []): { system: string; prompt: string } {
  const context = earlier
    .slice(-EARLIER_PROMPTS)
    .map(p => `<earlier>\n${p.replace(/\s+/g, ' ').trim().slice(0, MAX_EARLIER_CHARS)}\n</earlier>\n`)
    .join('')
  return {
    system: SYSTEM,
    prompt: `${context}<message>\n${prompt.slice(0, MAX_PROMPT_CHARS)}\n</message>`,
  }
}

/** A model's reply as a title: its first line without wrapping quotes or trailing punctuation. */
export function titleFromReply(reply: string): string | undefined {
  const line = reply.trim().split('\n')[0] ?? ''
  return titleFrom(line.replace(/^["'“‘「《\s]+|["'”’」》。.!！?？\s]+$/g, ''))
}
