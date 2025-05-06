import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';
import { mastra } from '@/mastra';

type CollectQuestionsOutput = {
  questions: string[];
};

type CollectQuestionsResult = {
  stepId: string;
  status: string;
  output: CollectQuestionsOutput;
};

export async function POST(req: Request) {
  try {
    // フォームデータの取得とバリデーション
    const formData = await req.formData();
    const file = formData.get('resume') as File | null;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: '有効なPDFファイルをアップロードしてください' }, { status: 400 });
    }

    // PDFファイルのパース
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParser = new PDFParser();

    let resumeText: string;
    try {
      resumeText = await new Promise<string>((resolve, reject) => {
        pdfParser.on('pdfParser_dataReady', (pdfData: { Pages: { Texts: { R: { T: string }[] }[] }[] }) => {
          const text = pdfData.Pages.map((page) =>
            page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(' ')
          ).join(' ');
          resolve(text);
        });
        pdfParser.on('pdfParser_dataError', (errMsg: { parserError: Error }) => {
          const error = errMsg.parserError;
          reject(new Error(`PDF解析エラー: ${error.message}`));
        });
        pdfParser.parseBuffer(buffer);
      });
    } catch (pdfError) {
      console.error('PDF解析エラー:', pdfError);
      return NextResponse.json({ error: 'PDFファイルの解析に失敗しました', details: (pdfError as Error).message }, { status: 500 });
    }

    console.log('解析された履歴書テキスト:', resumeText);

    // ワークフローの実行
    const { start } = mastra.getWorkflow('candidateWorkflow').createRun();
    let runResult;
    try {
      console.log('ワークフローに渡すtriggerData:', { resumeText }); // デバッグ用
      runResult = await start({
        triggerData: { resumeText },
      });
    } catch (workflowError) {
      console.error('ワークフロー実行エラー:', workflowError);
      return NextResponse.json({ 
        error: 'ワークフロー実行に失敗しました', 
        details: (workflowError as Error).message 
      }, { status: 500 });
    }

    console.log('ワークフロー実行結果:', JSON.stringify(runResult, null, 2));

    // ワークフロー結果の検証
    if (!runResult.results || typeof runResult.results !== 'object') {
      return NextResponse.json({ error: '無効なワークフロー結果です' }, { status: 500 });
    }

    // collectQuestionsステップの結果を取得
    const collectQuestionsResult = runResult.results['collectQuestions'] as CollectQuestionsResult;
    if (!collectQuestionsResult || collectQuestionsResult.status !== 'success' || !collectQuestionsResult.output || !collectQuestionsResult.output.questions) {
      console.error('collectQuestionsステップが見つからないか、成功していません:', collectQuestionsResult);
      return NextResponse.json({ error: 'ワークフローから質問を収集できませんでした。ステップの失敗を確認してください。' }, { status: 500 });
    }

    const questions = collectQuestionsResult.output.questions;
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('一般エラー:', error);
    return NextResponse.json({ 
      error: 'エラーが発生しました。', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}