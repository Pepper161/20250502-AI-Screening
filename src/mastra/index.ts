import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';
import { PostgresStore } from '@mastra/pg';
import { candidateWorkflow } from './workflows';
import { recruiterAgent } from './agents';

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