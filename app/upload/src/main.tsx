import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import QuestionPage from './components/QuestionPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QuestionPage />
  </StrictMode>
);