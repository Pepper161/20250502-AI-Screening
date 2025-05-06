import { Question, ApiResponse } from '../types';

export const fetchQuestions = async (formData: FormData): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const response = await fetch('/api/screen-candidate', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('APIリクエストに失敗しました');
        }

        const data = await response.json();
        const questions: Question[] = data.questions.map((q: string, index: number) => ({
          id: `q${index + 1}`,
          text: q,
        }));
        resolve(questions);
      } catch (error) {
        console.error('Fetch questions error:', error);
        reject(new Error('質問の取得に失敗しました'));
      }
    }, 1500); // Simulate network delay
  });
};

// Submit answers to the API
export const submitAnswers = async (
  answers: Record<string, string>
): Promise<ApiResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '回答が正常に送信されました！',
        data: answers
      });
    }, 2000); // Simulate network delay
  });
};