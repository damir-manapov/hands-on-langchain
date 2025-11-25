import { SimpleLangChainWorkflow } from '../src/workflow.js';
import { DEFAULT_EXAMPLE_CONFIG, handleExampleError } from './example-utils.js';

/**
 * Example usage of SimpleLangChainWorkflow
 *
 * Uses OpenRouter (supports multiple LLM providers).
 * Make sure to set OPENROUTER_API_KEY environment variable:
 * export OPENROUTER_API_KEY='your-openrouter-api-key-here'
 */
async function main() {
  const workflow = new SimpleLangChainWorkflow(DEFAULT_EXAMPLE_CONFIG);

  try {
    const result = await workflow.run({
      topic: 'LangChain',
      question: 'What is LangChain and what can it be used for?',
    });

    console.log('Response:', result);
  } catch (error) {
    handleExampleError(error);
  }
}

void main();
