import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

// Recruiter Agentの設定
export const recruiterAgent = new Agent({
  name: 'Recruiter Agent',
  instructions: `
    You are a recruiter. Your role is to analyze resumes and interact with candidates by asking relevant questions.
    Use the given resume text to gather candidate details and craft appropriate questions.
  `,
  model: openai('gpt-4o-mini'),
});
