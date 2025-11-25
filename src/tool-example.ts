import { ToolCallingWorkflow } from './tool-workflow.js';

/**
 * Example usage of ToolCallingWorkflow
 *
 * Uses OpenRouter (supports multiple LLM providers).
 * Make sure to set OPENROUTER_API_KEY environment variable:
 * export OPENROUTER_API_KEY='your-openrouter-api-key-here'
 */
async function main() {
  const workflow = new ToolCallingWorkflow({
    modelName: 'openai/gpt-3.5-turbo',
    temperature: 0.7,
  });

  console.log('Available tools:', workflow.getAvailableTools().join(', '));
  console.log('');

  const examples = [
    'What is 15 multiplied by 23?',
    'What is the weather in London?',
    'Convert "Hello World" to uppercase',
    'What is 100 divided by 4?',
  ];

  for (const question of examples) {
    try {
      console.log(`Question: ${question}`);
      const result = await workflow.run({ question });
      console.log(`Answer: ${result}`);
      console.log('');
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      console.log('');
    }
  }
}

void main();
