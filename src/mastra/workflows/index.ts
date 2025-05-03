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
    const prompt = `以下の履歴書テキストから次の詳細を抽出してください：
1. 候補者氏名
2. 技術職かどうか（true/false）
3. 専門分野またはスキル
4. 勤務している業界（例：建設、IT、一般事務）
5. 前職の役職
6. 出身地
7. 学歴
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

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo?.candidateName}に対して"${candidateInfo?.industryType}"業界での経験について短い質問を作成してください。
履歴書: ${candidateInfo?.resumeText}`;

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

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo?.candidateName}に対して"${candidateInfo?.industryType}"業界での経験、特に事務職について短い質問を作成してください。履歴書: ${candidateInfo?.resumeText}`;

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

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo?.candidateName}に対して学歴"${candidateInfo?.education}"について短い質問を作成してください。
履歴書: ${candidateInfo?.resumeText}`;

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

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo?.candidateName}に対して大学での学び"${candidateInfo?.education}"について短い質問を作成してください。履歴書: ${candidateInfo?.resumeText}`;

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

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo?.candidateName}に対して"${candidateInfo?.specialty}"のスキル使用について短い質問を作成してください。履歴書: ${candidateInfo?.resumeText}`;

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

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo?.candidateName}に対して出身地"${candidateInfo?.hometown}"について短い質問を作成してください。
履歴書: ${candidateInfo?.resumeText}`;

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

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo?.candidateName}に対して前職"${candidateInfo?.previousJob}"について短い質問を作成してください。
履歴書: ${candidateInfo?.resumeText}`;

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

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo?.candidateName}に対して専門分野"${candidateInfo?.specialty}"について短い質問を作成してください。
履歴書: ${candidateInfo?.resumeText}`;

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

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo?.candidateName}に対してこの役職への志望動機と将来のキャリアビジョンについて短い質問を作成してください。履歴書: ${candidateInfo?.resumeText}`;

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
      context.getStepResult('askAboutUniversityExperience')?.question,
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
  .step(askAboutEducation)
  .step(askAboutHometown)
  .step(askAboutMotivation)
  .step(askAboutUniversityExperience)
  .step(askAboutIndustry, { when: { 'gatherCandidateInfo.industryType': 'General Office Work' } })
  .step(askAboutGeneralRole, { when: { 'gatherCandidateInfo.industryType': 'General Office Work' } })
  .step(askAboutSpecialty, { when: { 'gatherCandidateInfo.isTechnical': true } })
  .step(askAboutSkills, { when: { 'gatherCandidateInfo.isTechnical': true } })
  .step(askAboutRole, { when: { 'gatherCandidateInfo.isTechnical': false } })
  .step(collectQuestions)
  .commit();