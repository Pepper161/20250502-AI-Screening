'use client';

import React, { useState } from 'react';
import { Question } from '../types';
import QuestionList from './QuestionList';
import SubmitButton from './SubmitButton';
import { useFormValidation } from '../hooks/useFormValidation';
import { submitAnswers } from '../utils/api';
import NotificationMessage from './NotificationMessage';

const AnswerForm: React.FC<{ initialQuestions: Question[] }> = ({ initialQuestions }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({
    type: 'success',
    message: '',
    isVisible: false
  });

  const { isValid, getValidationState } = useFormValidation(initialQuestions, answers);

  // Map question IDs to validation states
  const validationStates = initialQuestions.reduce(
    (acc, question) => ({
      ...acc,
      [question.id]: getValidationState(question.id)
    }),
    {}
  );

  // Handle answer changes
  const handleAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text
    }));
  };

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({
      type,
      message,
      isVisible: true
    });
  };

  // Dismiss notification
  const dismissNotification = () => {
    setNotification((prev) => ({
      ...prev,
      isVisible: false
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const response = await submitAnswers(answers);
      
      if (response.success) {
        showNotification('success', response.message || '回答が正常に送信されました！');
      } else {
        showNotification('error', response.message || '送信に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showNotification('error', '送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form className="space-y-8">
        <QuestionList
          questions={initialQuestions}
          answers={answers}
          validationStates={validationStates}
          onAnswerChange={handleAnswerChange}
        />
        
        <div className="sticky bottom-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-md p-4 flex justify-end">
          <SubmitButton
            isValid={isValid}
            isSubmitting={isSubmitting}
            onClick={handleSubmit}
          />
        </div>
      </form>

      <NotificationMessage
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onDismiss={dismissNotification}
      />
    </div>
  );
};

export default AnswerForm;