import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';

export interface WorkflowInput {
  topic: string;
  question: string;
}

export interface WorkflowConfig {
  modelName?: string;
  temperature?: number;
  apiKey?: string;
}

export class SimpleLangChainWorkflow {
  private readonly model: ChatOpenAI;
  private readonly prompt: ChatPromptTemplate;
  private readonly outputParser: StringOutputParser;

  constructor(config?: WorkflowConfig) {
    const apiKey = config?.apiKey ?? process.env['OPENROUTER_API_KEY'];

    if (!apiKey) {
      throw new Error(
        'OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable or pass apiKey in config.'
      );
    }

    this.model = new ChatOpenAI({
      modelName: config?.modelName ?? 'openai/gpt-3.5-turbo',
      temperature: config?.temperature ?? 0.7,
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

    this.prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a helpful assistant that provides clear and concise answers.'],
      ['human', 'Topic: {topic}\n\nQuestion: {question}'],
    ]);

    this.outputParser = new StringOutputParser();
  }

  async run(input: WorkflowInput): Promise<string> {
    const chain = this.prompt.pipe(this.model).pipe(this.outputParser);
    const result = await chain.invoke({
      topic: input.topic,
      question: input.question,
    });
    return result;
  }
}
