'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionPage from './src/components/QuestionPage';

interface Question {
  id: string;
  text: string;
}

export default function UploadPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedQuestions = sessionStorage.getItem('questions');
    if (storedQuestions) {
      const rawQuestions: Question[] = JSON.parse(storedQuestions);

      // サブ質問を分割して新しい質問リストを作成
      const splitQuestions: Question[] = [];
      rawQuestions.forEach((q, index) => {
        // 改行で分割し、空行を除外
        const lines = q.text.split('\n').filter(line => line.trim().length > 0);

        // 番号付きリスト（例: 1.）を持つ行のみをサブ質問として扱う
        const subQuestions: string[] = [];
        lines.forEach((line, lineIndex) => {
          const trimmedLine = line.trim();
          if (trimmedLine.match(/^\d+\.\s*.+/)) {
            // 番号付きのサブ質問の場合、番号を削除して追加
            const subQ = trimmedLine.replace(/^\d+\.\s*/, '');
            if (subQ) {
              subQuestions.push(subQ);
            }
          } else if (lineIndex === 0) {
            // 最初の行がサブ質問でない場合、メイン質問として扱う（スキップ）
            return;
          }
        });

        if (subQuestions.length > 0) {
          subQuestions.forEach((subQ, subIndex) => {
            splitQuestions.push({
              id: `q${index + 1}_${subIndex + 1}`,
              text: subQ,
            });
          });
        } else {
          // サブ質問がない場合、最初の行をメイン質問として追加
          splitQuestions.push({
            id: `q${index + 1}`,
            text: lines[0].trim(),
          });
        }
      });

      setQuestions(splitQuestions);
    } else {
      // 質問がない場合、ホームに戻る
      router.push('/');
    }
  }, [router]);

  if (questions.length === 0) {
    return <div>読み込み中...</div>;
  }

  return <QuestionPage initialQuestions={questions} />;
}