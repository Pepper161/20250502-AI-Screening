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
    console.log('sessionStorageから取得したquestions:', storedQuestions);

    if (storedQuestions) {
      try {
        const rawQuestions: string[] = JSON.parse(storedQuestions);
        console.log('パース後のrawQuestions:', rawQuestions);

        if (!Array.isArray(rawQuestions)) {
          console.error('rawQuestionsが配列ではありません:', rawQuestions);
          router.push('/');
          return;
        }

        const splitQuestions: Question[] = [];
        rawQuestions.forEach((q, index) => {
          if (typeof q !== 'string') {
            console.warn(`rawQuestions[${index}]が文字列ではありません:`, q);
            return;
          }

          console.log(`処理中の質問[${index}]:`, q);
          const lines = q.split('\n').filter(line => line.trim().length > 0);
          console.log(`分割後のlines[${index}]:`, lines);

          const subQuestions: string[] = [];
          lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();
            if (trimmedLine.match(/^\d+\.\s*.+/)) {
              const subQ = trimmedLine.replace(/^\d+\.\s*/, '');
              if (subQ) {
                subQuestions.push(subQ);
              }
            } else if (lineIndex === 0) {
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
          } else if (lines.length > 0) {
            splitQuestions.push({
              id: `q${index + 1}`,
              text: lines[0].trim(),
            });
          } else {
            console.warn(`質問[${index}]に有効な行がありません`);
          }
        });

        console.log('最終的なsplitQuestions:', splitQuestions);
        if (splitQuestions.length === 0) {
          console.warn('splitQuestionsが空です。ホームにリダイレクトします');
          router.push('/');
        } else {
          setQuestions(splitQuestions);
        }
      } catch (error) {
        console.error('JSONパースエラー:', error);
        router.push('/');
      }
    } else {
      console.warn('sessionStorageにquestionsが見つかりません');
      router.push('/');
    }
  }, [router]);

  if (questions.length === 0) {
    return <div>読み込み中...</div>;
  }

  return <QuestionPage initialQuestions={questions} />;
}