import React from 'react';
import { Send } from 'lucide-react';

interface SubmitButtonProps {
  isValid: boolean;
  isSubmitting: boolean;
  onClick: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isValid,
  isSubmitting,
  onClick
}) => {
  return (
    <button
      type="button"
      className={`
        flex items-center justify-center px-6 py-3 rounded-lg shadow-sm 
        text-white font-medium text-base transition-all duration-200
        ${
          isValid
            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            : 'bg-gray-400 cursor-not-allowed'
        }
        w-full sm:w-auto
      `}
      disabled={!isValid || isSubmitting}
      onClick={onClick}
    >
      {isSubmitting ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          送信中...
        </span>
      ) : (
        <span className="flex items-center">
          回答を送信する
          <Send className="ml-2 h-4 w-4" />
        </span>
      )}
    </button>
  );
};

export default SubmitButton;