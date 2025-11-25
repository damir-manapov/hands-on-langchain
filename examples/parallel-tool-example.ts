import { ParallelToolCallingWorkflow } from '../src/parallel-tool-workflow.js';
import { DEFAULT_EXAMPLE_CONFIG, handleExampleError } from './example-utils.js';

/**
 * Example usage of ParallelToolCallingWorkflow
 *
 * Uses OpenRouter (supports multiple LLM providers).
 * Make sure to set OPENROUTER_API_KEY environment variable:
 * export OPENROUTER_API_KEY='your-openrouter-api-key-here'
 *
 * This workflow executes multiple tool calls in parallel, which can be faster
 * when tools are independent of each other.
 */
async function main() {
  const workflow = new ParallelToolCallingWorkflow(DEFAULT_EXAMPLE_CONFIG);

  console.log('Available tools:', workflow.getAvailableTools().join(', '));
  console.log('');

  const examples = [
    'What is the weather in both London and Tokyo, and also calculate 12 multiplied by 8?',
    'Get weather for Paris and New York, then calculate 50 divided by 2',
    'What is 15 plus 25, multiply 7 by 9, and get the weather in Tokyo?',
  ];

  for (const question of examples) {
    try {
      console.log(`Question: ${question}`);
      const result = await workflow.run({ question });
      console.log(`Answer: ${result}`);
      console.log('');
    } catch (error) {
      handleExampleError(error, false); // Don't exit on individual example errors
      console.log('');
    }
  }
}

void main();
