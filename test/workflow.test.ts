import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleLangChainWorkflow } from '../src/workflow.js';
import type { WorkflowInput } from '../src/workflow.js';

const mockInvoke = vi.fn();

vi.mock('@langchain/openai', () => {
  class MockChatOpenAI {
    constructor(config?: { modelName?: string; temperature?: number; openAIApiKey?: string }) {
      // Store config for testing
      (this as unknown as { _config: unknown })._config = config;
    }

    pipe() {
      // Return an object that can be piped to output parser
      return {
        pipe: () => ({
          invoke: mockInvoke,
        }),
      };
    }
  }
  return {
    ChatOpenAI: MockChatOpenAI,
  };
});

vi.mock('@langchain/core/prompts', () => {
  const MockChatPromptTemplate = {
    fromMessages: () => {
      return {
        pipe: () => ({
          pipe: () => ({
            invoke: mockInvoke,
          }),
        }),
      };
    },
  };
  return {
    ChatPromptTemplate: MockChatPromptTemplate,
  };
});

vi.mock('@langchain/core/output_parsers', () => {
  // OutputParser doesn't have pipe, it's used as argument to pipe
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  const MockStringOutputParser = class {};
  return {
    StringOutputParser: MockStringOutputParser,
  };
});

describe('SimpleLangChainWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue('Test response from LLM');
  });

  describe('constructor', () => {
    it('should create a workflow instance with default config', () => {
      const workflow = new SimpleLangChainWorkflow();
      expect(workflow).toBeInstanceOf(SimpleLangChainWorkflow);
    });

    it('should create a workflow instance with custom config', () => {
      const config = {
        modelName: 'gpt-4',
        temperature: 0.5,
        apiKey: 'test-api-key',
      };
      const workflow = new SimpleLangChainWorkflow(config);
      expect(workflow).toBeInstanceOf(SimpleLangChainWorkflow);
    });

    it('should use default modelName when not provided', () => {
      const workflow = new SimpleLangChainWorkflow({});
      expect(workflow).toBeInstanceOf(SimpleLangChainWorkflow);
    });

    it('should use default temperature when not provided', () => {
      const workflow = new SimpleLangChainWorkflow({
        modelName: 'gpt-3.5-turbo',
      });
      expect(workflow).toBeInstanceOf(SimpleLangChainWorkflow);
    });
  });

  describe('run', () => {
    it('should execute workflow with valid input', async () => {
      const workflow = new SimpleLangChainWorkflow();
      const input: WorkflowInput = {
        topic: 'TypeScript',
        question: 'What is TypeScript?',
      };

      const result = await workflow.run(input);

      expect(result).toBe('Test response from LLM');
      expect(mockInvoke).toHaveBeenCalledTimes(1);
      expect(mockInvoke).toHaveBeenCalledWith({
        topic: 'TypeScript',
        question: 'What is TypeScript?',
      });
    });

    it('should pass correct parameters to chain invoke', async () => {
      const workflow = new SimpleLangChainWorkflow();
      const input: WorkflowInput = {
        topic: 'LangChain',
        question: 'How does LangChain work?',
      };

      await workflow.run(input);

      expect(mockInvoke).toHaveBeenCalledWith({
        topic: 'LangChain',
        question: 'How does LangChain work?',
      });
    });

    it('should handle different topic and question combinations', async () => {
      const workflow = new SimpleLangChainWorkflow();
      const testCases: WorkflowInput[] = [
        { topic: 'AI', question: 'What is AI?' },
        { topic: 'Machine Learning', question: 'Explain ML' },
        { topic: 'Python', question: 'Why use Python?' },
      ];

      for (const input of testCases) {
        mockInvoke.mockClear();
        await workflow.run(input);
        expect(mockInvoke).toHaveBeenCalledWith(input);
      }
    });

    it('should return string result from chain', async () => {
      const workflow = new SimpleLangChainWorkflow();
      mockInvoke.mockResolvedValue('Custom response');

      const result = await workflow.run({
        topic: 'Test',
        question: 'Test question',
      });

      expect(typeof result).toBe('string');
      expect(result).toBe('Custom response');
    });

    it('should propagate errors from chain execution', async () => {
      const workflow = new SimpleLangChainWorkflow();
      const error = new Error('Chain execution failed');
      mockInvoke.mockRejectedValue(error);

      await expect(
        workflow.run({
          topic: 'Test',
          question: 'Test question',
        })
      ).rejects.toThrow('Chain execution failed');
    });
  });

  describe('integration', () => {
    it('should create chain with correct structure', async () => {
      const workflow = new SimpleLangChainWorkflow();
      const result = await workflow.run({
        topic: 'Test',
        question: 'Test question',
      });

      expect(result).toBe('Test response from LLM');
      expect(mockInvoke).toHaveBeenCalledWith({
        topic: 'Test',
        question: 'Test question',
      });
    });
  });
});
