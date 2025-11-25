import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createOpenRouterModel, type ModelConfig } from './model-utils.js';

export interface WorkflowInput {
  topic: string;
  question: string;
}

export type WorkflowConfig = ModelConfig;

export class SimpleLangChainWorkflow {
  private readonly model: ChatOpenAI;
  private readonly prompt: ChatPromptTemplate;
  private readonly outputParser: StringOutputParser;

  constructor(config?: WorkflowConfig) {
    this.model = createOpenRouterModel(config);

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
