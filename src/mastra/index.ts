import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';
import { candidateWorkflow } from './workflows';
import { recruiterAgent } from './agents';

export const mastra = new Mastra({
  workflows: { candidateWorkflow },
  agents: { recruiterAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

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