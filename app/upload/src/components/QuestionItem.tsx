import React from 'react';
import { Question } from '../types';

interface QuestionItemProps {
  question: Question;
  answer: string;
  validationState: 'valid' | 'invalid' | 'pristine';
  onChange: (id: string, value: string) => void;
  autoFocus?: boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  answer,
  validationState,
  onChange,
  autoFocus = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(question.id, e.target.value);
  };

  const getBorderColor = () => {
    if (validationState === 'invalid') return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    if (validationState === 'valid') return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  const getHelpText = () => {
    if (validationState === 'invalid') {
      return <p className="mt-1 text-sm text-red-600">回答は10文字以上入力してください。</p>;
    }
    if (answer && answer.length > 0 && validationState === 'valid') {
      return <p className="mt-1 text-sm text-green-600">回答の長さは十分です。</p>;
    }
    return null;
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{question.text}</h3>
        <div className="mt-2">
          <textarea
            id={`question-${question.id}`}
            name={`question-${question.id}`}
            rows={4}
            className={`block w-full rounded-md shadow-sm py-3 px-4 resize-y ${getBorderColor()} focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-150`}
            placeholder="ここに回答を入力してください..."
            value={answer}
            onChange={handleChange}
            autoFocus={autoFocus}
          />
          {getHelpText()}
        </div>
      </div>
    </div>
  );
};

export default QuestionItem;