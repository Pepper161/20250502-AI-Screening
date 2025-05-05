import React from 'react';
import { Question } from '../types';
import QuestionItem from './QuestionItem';

interface QuestionListProps {
  questions: Question[];
  answers: Record<string, string>;
  validationStates: Record<string, 'valid' | 'invalid' | 'pristine'>;
  onAnswerChange: (id: string, value: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  answers,
  validationStates,
  onAnswerChange
}) => {
  if (questions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        質問が生成されるのを待っています...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <QuestionItem
          key={question.id}
          question={question}
          answer={answers[question.id] || ''}
          validationState={validationStates[question.id] || 'pristine'}
          onChange={onAnswerChange}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
};

export default QuestionList;