const CHAT_MESSAGE_MAX_LENGTH = 2000;

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /forget\s+(everything|all(\s+previous)?)/gi,
  /you\s+are\s+now\s+(a|an)\b/gi,
  /\[INST\]/g,
  /<\s*\/?system\s*>/gi,
  /^(system|assistant)\s*:/gim,
];

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, '');
}

function neutralizeInjections(text: string): string {
  let result = text;
  for (const pattern of INJECTION_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, '[FILTERED]');
  }
  return result;
}

function sanitizeField(value: string, maxLength: number): string {
  return neutralizeInjections(stripHtml(value.trim())).slice(0, maxLength);
}

export type ResumeFields = {
  name: string;
  occupation: string;
  industry: string;
  jobDescription: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
  awards: string;
};

const RESUME_FIELD_LIMITS = {
  name: 100,
  occupation: 150,
  industry: 150,
  jobDescription: 3000,
  summary: 1500,
  skills: 1500,
  experience: 5000,
  education: 1500,
  awards: 1000,
} as const;

export function sanitizeResumeData(data: ResumeFields): ResumeFields {
  return {
    name: sanitizeField(data.name, RESUME_FIELD_LIMITS.name),
    occupation: sanitizeField(data.occupation, RESUME_FIELD_LIMITS.occupation),
    industry: sanitizeField(data.industry, RESUME_FIELD_LIMITS.industry),
    jobDescription: sanitizeField(data.jobDescription, RESUME_FIELD_LIMITS.jobDescription),
    summary: sanitizeField(data.summary, RESUME_FIELD_LIMITS.summary),
    skills: sanitizeField(data.skills, RESUME_FIELD_LIMITS.skills),
    experience: sanitizeField(data.experience, RESUME_FIELD_LIMITS.experience),
    education: sanitizeField(data.education, RESUME_FIELD_LIMITS.education),
    awards: sanitizeField(data.awards, RESUME_FIELD_LIMITS.awards),
  };
}

export function sanitizeChatMessage(message: string): string {
  return sanitizeField(message, CHAT_MESSAGE_MAX_LENGTH);
}
