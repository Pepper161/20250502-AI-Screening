import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { recruiterAgent } from '../agents';

// 候補者情報を収集するステップ
const gatherCandidateInfo = new Step({
  id: 'gatherCandidateInfo',
  inputSchema: z.object({
    resumeText: z.string(),
  }),
  outputSchema: z.object({
    candidateName: z.string(),
    isTechnical: z.boolean(),
    specialty: z.string(),
    industryType: z.string(),
    previousJob: z.string(),
    hometown: z.string(),
    education: z.string(),
    resumeText: z.string(),
  }),
  execute: async ({ context }) => {
    const resumeText = context?.getStepResult<{ resumeText: string }>('trigger')?.resumeText || '';
    const prompt = `Extract the following details from the resume text:
1. Candidate name
2. Whether they are technical (true/false)
3. Their specialty or expertise
4. Industry type they work in (e.g., construction, IT, general office work)
5. Previous job title
6. Hometown
7. Education background
"${resumeText}"`;

    const res = await recruiterAgent.generate(prompt, {
      output: z.object({
        candidateName: z.string(),
        isTechnical: z.boolean(),
        specialty: z.string(),
        industryType: z.string(),
        previousJob: z.string(),
        hometown: z.string(),
        education: z.string(),
        resumeText: z.string(),
      }),
    });

    return res.object;
  },
});

// 業種に応じた質問を生成するステップ
const askAboutIndustry = new Step({
  id: 'askAboutIndustry',
  outputSchema: z.object({
    question: z.string(),
  }),
  execute: async ({ context }) => {
    const candidateInfo = context?.getStepResult<{ candidateName: string; industryType: string; resumeText: string }>('gatherCandidateInfo');

    const prompt = `You are a recruiter. Given the resume below, craft a short question for ${candidateInfo?.candidateName} about their experience in the "${candidateInfo?.industryType}" industry.
Resume: ${candidateInfo?.resumeText}`;

    const res = await recruiterAgent.generate(prompt);
    return { question: res?.text?.trim() || '' };
  },
});

// 一般職種に関する質問を生成するステップ
const askAboutGeneralRole = new Step({
  id: 'askAboutGeneralRole',
  outputSchema: z.object({
    question: z.string(),
  }),
  execute: async ({ context }) => {
    const candidateInfo = context?.getStepResult<{ candidateName: string; industryType: string; resumeText: string }>('gatherCandidateInfo');

    const prompt = `You are a recruiter. Given the resume below, craft a short question for ${candidateInfo?.candidateName} about their experience in the "${candidateInfo?.industryType}" industry, especially for an administrative role. Resume: ${candidateInfo?.resumeText}`;

    const res = await recruiterAgent.generate(prompt);
    return { question: res?.text?.trim() || '' };
  },
});

// 学歴に関する質問を生成するステップ
const askAboutEducation = new Step({
  id: 'askAboutEducation',
  outputSchema: z.object({
    question: z.string(),
  }),
  execute: async ({ context }) => {
    const candidateInfo = context?.getStepResult<{ candidateName: string; education: string; resumeText: string }>('gatherCandidateInfo');

    const prompt = `You are a recruiter. Given the resume below, craft a short question for ${candidateInfo?.candidateName} about their education background: "${candidateInfo?.education}".
Resume: ${candidateInfo?.resumeText}`;

    const res = await recruiterAgent.generate(prompt);
    return { question: res?.text?.trim() || '' };
  },
});

// 大学生向け新規採用の質問を生成するステップ
const askAboutUniversityExperience = new Step({
  id: 'askAboutUniversityExperience',
  outputSchema: z.object({
    question: z.string(),
  }),
  execute: async ({ context }) => {
    const candidateInfo = context?.getStepResult<{ candidateName: string; education: string; resumeText: string }>('gatherCandidateInfo');

    const prompt = `You are a recruiter. Given the resume below, craft a short question for ${candidateInfo?.candidateName} about their university studies: "${candidateInfo?.education}". Resume: ${candidateInfo?.resumeText}`;

    const res = await recruiterAgent.generate(prompt);
    return { question: res?.text?.trim() || '' };
  },
});

// 資格とスキルに関する質問を生成するステップ
const askAboutSkills = new Step({
  id: 'askAboutSkills',
  outputSchema: z.object({
    question: z.string(),
  }),
  execute: async ({ context }) => {
    const candidateInfo = context?.getStepResult<{ candidateName: string; specialty: string; resumeText: string }>('gatherCandidateInfo');

    const prompt = `You are a recruiter. Given the resume below, craft a short question for ${candidateInfo?.candidateName} about how they use their skills in "${candidateInfo?.specialty}". Resume: ${candidateInfo?.resumeText}`;

    const res = await recruiterAgent.generate(prompt);
    return { question: res?.text?.trim() || '' };
  },
});

// 出身地に関する質問を生成するステップ
const askAboutHometown = new Step({
  id: 'askAboutHometown',
  outputSchema: z.object({
    question: z.string(),
  }),
  execute: async ({ context }) => {
    const candidateInfo = context?.getStepResult<{ candidateName: string; hometown: string; resumeText: string }>('gatherCandidateInfo');

    const prompt = `You are a recruiter. Given the resume below, craft a short question for ${candidateInfo?.candidateName} about their hometown: "${candidateInfo?.hometown}".
Resume: ${candidateInfo?.resumeText}`;

    const res = await recruiterAgent.generate(prompt);
    return { question: res?.text?.trim() || '' };
  },
});

// 技術者以外の役割に関する質問を生成するステップ
const askAboutRole = new Step({
  id: 'askAboutRole',
  outputSchema: z.object({
    question: z.string(),
  }),
  execute: async ({ context }) => {
    const candidateInfo = context?.getStepResult<{ candidateName: string; previousJob: string; resumeText: string }>('gatherCandidateInfo');

    const prompt = `You are a recruiter. Given the resume below, craft a short question for ${candidateInfo?.candidateName} about their previous role: "${candidateInfo?.previousJob}".
Resume: ${candidateInfo?.resumeText}`;

    const res = await recruiterAgent.generate(prompt);
    return { question: res?.text?.trim() || '' };
  },
});

// 専門性に関する質問を生成するステップ
const askAboutSpecialty = new Step({
  id: 'askAboutSpecialty',
  outputSchema: z.object({
    question: z.string(),
  }),
  execute: async ({ context }) => {
    const candidateInfo = context?.getStepResult<{ candidateName: string; specialty: string; resumeText: string }>('gatherCandidateInfo');

    const prompt = `You are a recruiter. Given the resume below, craft a short question for ${candidateInfo?.candidateName} about their specialty: "${candidateInfo?.specialty}".
Resume: ${candidateInfo?.resumeText}`;

    const res = await recruiterAgent.generate(prompt);
    return { question: res?.text?.trim() || '' };
  },
});

// 志望動機に関する質問を生成するステップ（大学生向け）
const askAboutMotivation = new Step({
  id: 'askAboutMotivation',
  outputSchema: z.object({
    question: z.string(),
  }),
  execute: async ({ context }) => {
    const candidateInfo = context?.getStepResult<{ candidateName: string; resumeText: string }>('gatherCandidateInfo');

    const prompt = `You are a recruiter. Given the resume below, craft a short question for ${candidateInfo?.candidateName} about why they are interested in this role and how they envision their future career. Resume: ${candidateInfo?.resumeText}`;

    const res = await recruiterAgent.generate(prompt);
    return { question: res?.text?.trim() || '' };
  },
});


// 質問を集めるステップ
const collectQuestions = new Step({
  id: 'collectQuestions',
  outputSchema: z.object({
    questions: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const questions = [
      context.getStepResult('askAboutIndustry')?.question,
      context.getStepResult('askAboutGeneralRole')?.question,
      context.getStepResult('askAboutEducation')?.question,
      context.getStepResult('askAboutHometown')?.question,
      context.getStepResult('askAboutSpecialty')?.question,
      context.getStepResult('askAboutSkills')?.question,
      context.getStepResult('askAboutRole')?.question,
      context.getStepResult('askAboutMotivation')?.question,
    ].filter((q) => q) as string[];
    return { questions };
  },
});


// ワークフローの構築
export const candidateWorkflow = new Workflow({
  name: 'candidate-workflow',
  triggerSchema: z.object({
    resumeText: z.string(),
  }),
});

candidateWorkflow
  .step(gatherCandidateInfo)
  .then(askAboutIndustry, {
    when: { 'gatherCandidateInfo.industryType': 'General Office Work' },
  })
  .then(askAboutGeneralRole)
  .then(askAboutEducation)
  .then(askAboutHometown)
  .then(askAboutSpecialty, {
    when: { 'gatherCandidateInfo.isTechnical': true },
  })
  .then(askAboutSkills)
  .step(askAboutRole, {
    when: { 'gatherCandidateInfo.isTechnical': false },
  })
  .then(askAboutMotivation)
  .then(collectQuestions) // 追加
  .commit();



candidateWorkflow.commit();
