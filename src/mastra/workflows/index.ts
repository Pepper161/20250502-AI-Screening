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
    candidateName: z.string().optional(),
    isTechnical: z.boolean().optional(),
    specialty: z.string().optional(),
    industryType: z.string().optional(),
    previousJob: z.string().optional(),
    hometown: z.string().optional(),
    education: z.string().optional(),
    resumeText: z.string(),
  }),
  execute: async ({ context }) => {
    const resumeText = context?.getStepResult<{ resumeText: string }>('trigger')?.resumeText || '';
    console.log('Received resumeText in gatherCandidateInfo:', resumeText); // デバッグ用
    const prompt = `以下の日本語の履歴書テキストを解析し、指定されたフィールドに情報を抽出してください。情報が見つからない場合は空の文字列を返し、技術職かどうかは「エンジニア」「開発者」などのキーワードが含まれていればtrueと判断してください。必ず以下のJSON形式で応答してください。応答はJSONのみで、説明や余計なテキストを含めないでください：
{
  "candidateName": "",
  "isTechnical": false,
  "specialty": "",
  "industryType": "",
  "previousJob": "",
  "hometown": "",
  "education": "",
  "resumeText": ""
}
例：
{
  "candidateName": "青木 大地",
  "isTechnical": true,
  "specialty": "Webアプリケーション開発",
  "industryType": "IT",
  "previousJob": "ソフトウェアエンジニア",
  "hometown": "東京都新宿区",
  "education": "東京大学 コンピュータサイエンス学部 卒業",
  "resumeText": "履歴書 氏名 : 青木 大地 ..."
}
フィールド：
- candidateName: 氏名（履歴書の上部に見出し「氏名」で記載）
- isTechnical: 技術職かどうか（true/false）
- specialty: 専門分野またはスキル（職歴やスキルセクションから）
- industryType: 勤務業界（例：IT、一般事務、職歴から推測）
- previousJob: 前職の役職
- hometown: 出身地（住所から推測）
- education: 学歴（見出し「学歴」以下）
- resumeText: 元のテキスト（そのまま返す）
履歴書: "${resumeText}"`;

    try {
      const res = await recruiterAgent.generate(prompt, {
        output: z.object({
          candidateName: z.string().optional(),
          isTechnical: z.boolean().optional(),
          specialty: z.string().optional(),
          industryType: z.string().optional(),
          previousJob: z.string().optional(),
          hometown: z.string().optional(),
          education: z.string().optional(),
          resumeText: z.string(),
        }),
      });
      console.log('Agent response in gatherCandidateInfo:', res.object);
      return res.object || {
        candidateName: '',
        isTechnical: false,
        specialty: '',
        industryType: '',
        previousJob: '',
        hometown: '',
        education: '',
        resumeText,
      };
    } catch (error) {
      console.error('Agent generation error in gatherCandidateInfo:', error);
      return {
        candidateName: '',
        isTechnical: false,
        specialty: '',
        industryType: '',
        previousJob: '',
        hometown: '',
        education: '',
        resumeText,
      };
    }
  },
});

// 業種に応じた質問を生成するステップ
const askAboutIndustry = new Step({
  id: 'askAboutIndustry',
  outputSchema: z.object({
    question: z.string(),
  }),
  execute: async ({ context }) => {
    const candidateInfo = context?.getStepResult<{ candidateName: string; industryType: string; resumeText: string }>('gatherCandidateInfo') || { candidateName: '', industryType: '', resumeText: '' };
    console.log('candidateInfo in askAboutIndustry:', candidateInfo);
    if (!candidateInfo.industryType) return { question: '業界に関する情報が不足しています。どの業界で働いていましたか？' };

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo.candidateName || '候補者'}に対して"${candidateInfo.industryType}"業界での経験について短い質問を作成してください。質問は日本語で、簡潔にしてください。
履歴書: ${candidateInfo.resumeText}`;
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
    const candidateInfo = context?.getStepResult<{ candidateName: string; education: string; resumeText: string }>('gatherCandidateInfo') || { candidateName: '', education: '', resumeText: '' };
    console.log('candidateInfo in askAboutEducation:', candidateInfo);
    if (!candidateInfo.education) return { question: '学歴に関する情報が不足しています。具体的な学歴を教えてください。' };

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo.candidateName || '候補者'}に対して学歴"${candidateInfo.education}"について短い質問を作成してください。質問は日本語で、簡潔にしてください。
履歴書: ${candidateInfo.resumeText}`;
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
    const candidateInfo = context?.getStepResult<{ candidateName: string; hometown: string; resumeText: string }>('gatherCandidateInfo') || { candidateName: '', hometown: '', resumeText: '' };
    console.log('candidateInfo in askAboutHometown:', candidateInfo);
    if (!candidateInfo.hometown) return { question: '出身地に関する情報が不足しています。出身地を教えてください。' };

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo.candidateName || '候補者'}に対して出身地"${candidateInfo.hometown}"について短い質問を作成してください。質問は日本語で、簡潔にしてください。
履歴書: ${candidateInfo.resumeText}`;
    const res = await recruiterAgent.generate(prompt);
    return { question: res?.text?.trim() || '' };
  },
});

// 志望動機に関する質問を生成するステップ
const askAboutMotivation = new Step({
  id: 'askAboutMotivation',
  outputSchema: z.object({
    question: z.string(),
  }),
  execute: async ({ context }) => {
    const candidateInfo = context?.getStepResult<{ candidateName: string; resumeText: string }>('gatherCandidateInfo') || { candidateName: '', resumeText: '' };
    console.log('candidateInfo in askAboutMotivation:', candidateInfo);
    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、${candidateInfo.candidateName || '候補者'}に対してこの役職への志望動機と将来のキャリアビジョンについて短い質問を作成してください。質問は日本語で、簡潔にしてください。履歴書: ${candidateInfo.resumeText}`;
    const res = await recruiterAgent.generate(prompt);
    return { question: res?.text?.trim() || '志望動機について教えてください。' };
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
      context.getStepResult('askAboutEducation')?.question,
      context.getStepResult('askAboutHometown')?.question,
      context.getStepResult('askAboutMotivation')?.question,
    ].filter((q) => q && q.trim().length > 0) as string[];
    console.log('Collected questions:', questions);
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
  .then(askAboutEducation)
  .then(askAboutHometown)
  .then(askAboutMotivation)
  .then(askAboutIndustry)
  .then(collectQuestions)
  .commit();