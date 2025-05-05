export interface Question {
  id: string;
  text: string;
}

export interface Answer {
  questionId: string;
  text: string;
}

export interface FormState {
  questions: Question[];
  answers: Record<string, string>;
  isLoading: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}