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
    console.log('Received resumeText in gatherCandidateInfo:', resumeText);
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

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、候補者に対して"${candidateInfo.industryType}"業界での経験について、以下の形式で5つの短いサブ質問を作成してください。質問は日本語で、簡潔にしてください。候補者名は質問の冒頭に一度だけ記述し、以降は省略してください。形式：
候補者名、IT業界での経験についてお伺いします。
1. 質問1
2. 質問2
3. 質問3
4. 質問4
5. 質問5
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
    const candidateInfo = context?.getStepResult<{ education: string; resumeText: string }>('gatherCandidateInfo') || { education: '', resumeText: '' };
    console.log('candidateInfo in askAboutEducation:', candidateInfo);
    if (!candidateInfo.education) return { question: '学歴に関する情報が不足しています。具体的な学歴を教えてください。' };

    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、学歴"${candidateInfo.education}"について、以下の形式で2つの短いサブ質問を作成してください。質問は日本語で、簡潔にしてください。候補者名を含めないでください。形式：
1. 質問1
2. 質問2
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
    const candidateInfo = context?.getStepResult<{ resumeText: string }>('gatherCandidateInfo') || { resumeText: '' };
    console.log('candidateInfo in askAboutMotivation:', candidateInfo);
    const prompt = `あなたは採用担当者です。以下の履歴書に基づき、この役職への志望動機と将来のキャリアビジョンについて、以下の形式で2つの短いサブ質問を作成してください。質問は日本語で、簡潔にしてください。候補者名を含めないでください。形式：
1. 質問1
2. 質問2
履歴書: ${candidateInfo.resumeText}`;
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
    const candidateInfo = context?.getStepResult<{ candidateName: string }>('gatherCandidateInfo') || { candidateName: '' };
    const questions = [
      context.getStepResult('askAboutIndustry')?.question,
      context.getStepResult('askAboutEducation')?.question,
      context.getStepResult('askAboutMotivation')?.question,
    ].filter((q) => q && q.trim().length > 0) as string[];

    // 質問を一括して名前を付加
    const formattedQuestions = questions.map((q, index) => {
      if (index === 0 && candidateInfo.candidateName) {
        return `${candidateInfo.candidateName}さん、${q}`;
      }
      return q;
    });

    console.log('Collected questions:', formattedQuestions);
    return { questions: formattedQuestions };
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
  .then(askAboutMotivation)
  .then(askAboutIndustry)
  .then(collectQuestions)
  .commit();