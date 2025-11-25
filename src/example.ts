import { SimpleLangChainWorkflow } from './workflow.js';

/**
 * Example usage of SimpleLangChainWorkflow
 *
 * Uses OpenRouter (supports multiple LLM providers).
 * Make sure to set OPENROUTER_API_KEY environment variable:
 * export OPENROUTER_API_KEY='your-openrouter-api-key-here'
 */
async function main() {
  const workflow = new SimpleLangChainWorkflow({
    modelName: 'openai/gpt-3.5-turbo',
    temperature: 0.7,
  });

  try {
    const result = await workflow.run({
      topic: 'LangChain',
      question: 'What is LangChain and what can it be used for?',
    });

    console.log('Response:', result);
  } catch (error) {
    console.error('Error running workflow:', error);
    process.exit(1);
  }
}

void main();
