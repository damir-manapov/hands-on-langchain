import type { ModelConfig } from '../src/model-utils.js';

/**
 * Default configuration for examples
 */
export const DEFAULT_EXAMPLE_CONFIG: ModelConfig = {
  modelName: 'openai/gpt-3.5-turbo',
  temperature: 0.7,
};

/**
 * Handles errors in example scripts with consistent formatting
 * @param error The error to handle
 * @param exitOnError Whether to exit the process on error (default: true)
 */
export function handleExampleError(error: unknown, exitOnError = true): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('Error:', errorMessage);
  if (exitOnError) {
    process.exit(1);
  }
}
