import { ToolCallingWorkflow } from '../src/tool-workflow.js';
import { DEFAULT_EXAMPLE_CONFIG, handleExampleError } from './example-utils.js';

/**
 * Example usage of ToolCallingWorkflow
 *
 * Uses OpenRouter (supports multiple LLM providers).
 * Make sure to set OPENROUTER_API_KEY environment variable:
 * export OPENROUTER_API_KEY='your-openrouter-api-key-here'
 */
async function main() {
  const workflow = new ToolCallingWorkflow(DEFAULT_EXAMPLE_CONFIG);

  console.log('Available tools:', workflow.getAvailableTools().join(', '));
  console.log('');

  const examples = [
    'What is 15 multiplied by 23?',
    'What is the weather in London?',
    'Convert "Hello World" to uppercase',
    'What is 100 divided by 4?',
    'Calculate 25 plus 17, then convert the result to uppercase and tell me its length',
    'What is the weather in both London and Tokyo, and also calculate 12 multiplied by 8?',
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
