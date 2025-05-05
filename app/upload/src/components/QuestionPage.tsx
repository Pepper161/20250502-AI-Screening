'use client';

import React from 'react';
import AnswerForm from './AnswerForm';
import { FileText } from 'lucide-react';

interface Question {
  id: string;
  text: string;
}

interface QuestionPageProps {
  initialQuestions: Question[];
}

const QuestionPage: React.FC<QuestionPageProps> = ({ initialQuestions }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">採用スクリーニング</h1>
            </div>
            <div className="text-sm text-gray-500">
              応募ID: ACK-2025-0142
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Instructions Panel */}
          <div className="bg-blue-50 p-6 border-b border-blue-100">
            <h2 className="text-lg font-medium text-blue-800 mb-2">
              質問に回答してください
            </h2>
            <p className="text-blue-700">
              あなたの履歴書に基づいて、AIが以下の質問を生成しました。各質問に対して詳細な回答を入力してください。
              すべての質問に回答した後、「回答を送信する」ボタンをクリックしてください。
            </p>
          </div>

          {/* Answer Form */}
          <div className="p-6">
            <AnswerForm initialQuestions={initialQuestions} />
          </div>
        </div>

        {/* Instructions and Notes */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">注意事項</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>すべての質問に少なくとも10文字以上で回答してください。</li>
            <li>回答は採用プロセスの評価対象となります。</li>
            <li>回答内容は後で編集することができません。送信前に内容を確認してください。</li>
            <li>質問や技術的な問題がある場合は、support@example.com までお問い合わせください。</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 採用スクリーニングプラットフォーム. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                プライバシーポリシー
              </a>
              <span className="mx-2 text-gray-300">|</span>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                利用規約
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QuestionPage;