import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { parse } from 'pdf-parse';
import { mastra } from '@/mastra';
import { StepResult } from '@mastra/core/workflows';

type CollectQuestionsResult = {
  stepId: string;
  output: { questions: string[] };
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume') as File | null;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file' }, { status: 400 });
    }

    // ファイルをバッファに変換
    const buffer = Buffer.from(await file.arrayBuffer());

    // PDFからテキストを抽出
    const pdfData = await parse(buffer);
    const resumeText = pdfData.text;

    // screen-candidate APIのロジックを再利用
    const { start } = mastra.getWorkflow('candidateWorkflow').createRun();
    const runResult = await start({
      triggerData: { resumeText },
    });

    if (!Array.isArray(runResult.results)) {
      return NextResponse.json({ error: 'Invalid workflow results' }, { status: 500 });
    }

    const collectQuestionsResult = runResult.results.find(
      (result: CollectQuestionsResult) => result.stepId === 'collectQuestions'
    );

    if (!collectQuestionsResult) {
      return NextResponse.json({ error: 'collectQuestions step not found' }, { status: 404 });
    }

    const questions = collectQuestionsResult.output.questions || [];
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 });
  }
}