import { useMemo } from 'react';
import { Question } from '../types';

export const useFormValidation = (
  questions: Question[],
  answers: Record<string, string>
) => {
  // Check if all questions have an answer with minimum length
  const isValid = useMemo(() => {
    if (questions.length === 0) return false;
    
    return questions.every(
      (question) => 
        answers[question.id] && 
        answers[question.id].trim().length >= 10
    );
  }, [questions, answers]);

  // Get validation state for individual answers
  const getValidationState = (questionId: string): 'valid' | 'invalid' | 'pristine' => {
    const answer = answers[questionId];
    
    if (!answer || answer.trim().length === 0) return 'pristine';
    if (answer.trim().length < 10) return 'invalid';
    return 'valid';
  };

  return {
    isValid,
    getValidationState
  };
};