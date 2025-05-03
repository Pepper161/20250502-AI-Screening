import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';
import { PostgresStore } from '@mastra/pg';
import { candidateWorkflow } from './workflows';
import { recruiterAgent } from './agents';

// 環境変数の確認
if (!process.env.POSTGRES_CONNECTION_STRING) {
  throw new Error('POSTGRES_CONNECTION_STRING is not defined in .env.local');
}
console.log('Using POSTGRES_CONNECTION_STRING:', process.env.POSTGRES_CONNECTION_STRING);

export const mastra = new Mastra({
  workflows: { candidateWorkflow },
  agents: { recruiterAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  storage: new PostgresStore({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
  }),
});

// テストコード
(async () => {
  try {
    const { runId, start } = mastra.getWorkflow('candidateWorkflow').createRun();
    console.log('Run', runId);
    const runResult = await start({
      triggerData: { resumeText: 'Simulated resume content...' },
    });
    console.log('Final output:', runResult.results);
  } catch (error) {
    console.error('Error during workflow execution:', error);
  }
})();