'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('PDFファイルを選択してください');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/screen-candidate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('APIリクエストに失敗しました');
      }

      const data = await response.json();
      const questions = data.questions || [];
      const formattedQuestions = questions.map((q: string, index: number) => ({
        id: `q${index + 1}`,
        text: q,
      }));

      // 質問データをセッションストレージに保存
      sessionStorage.setItem('questions', JSON.stringify(formattedQuestions));
      setError(null);

      // アップロードページ（QuestionPage）へリダイレクト
      router.push('/upload');
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>採用スクリーニングシステム</h1>
      <h2>履歴書アップロード</h2>
      <p>以下のフォームから履歴書（PDF形式）をアップロードしてください。AIが履歴書を解析し、質問を生成します。</p>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button type="submit">アップロード</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}