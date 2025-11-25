import { ChatOpenAI } from '@langchain/openai';

/**
 * Shared configuration for all workflows using OpenRouter
 */
export interface ModelConfig {
  modelName?: string;
  temperature?: number;
  apiKey?: string;
}

/**
 * Default model configuration values
 */
const DEFAULT_MODEL_NAME = 'openai/gpt-3.5-turbo';
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Validates and retrieves the OpenRouter API key from config or environment
 * @throws Error if API key is not found
 */
export function getApiKey(config?: ModelConfig): string {
  const apiKey = config?.apiKey ?? process.env['OPENROUTER_API_KEY'];

  if (!apiKey) {
    throw new Error(
      'OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable or pass apiKey in config.'
    );
  }

  return apiKey;
}

/**
 * Creates a ChatOpenAI instance configured for OpenRouter
 * @param config Optional model configuration
 * @returns Configured ChatOpenAI instance
 */
export function createOpenRouterModel(config?: ModelConfig): ChatOpenAI {
  const apiKey = getApiKey(config);

  return new ChatOpenAI({
    modelName: config?.modelName ?? DEFAULT_MODEL_NAME,
    temperature: config?.temperature ?? DEFAULT_TEMPERATURE,
    openAIApiKey: apiKey,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env['OPENROUTER_HTTP_REFERER'] ?? '',
        'X-Title': 'Hands-on LangChain',
      },
      apiKey: apiKey,
    },
  });
}
