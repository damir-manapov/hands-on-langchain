import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToolCallingWorkflow } from '../src/tool-workflow.js';

const mockInvoke = vi.fn();
const mockBindTools = vi.fn();

vi.mock('@langchain/openai', () => {
  class MockChatOpenAI {
    bindTools() {
      return mockBindTools() as unknown;
    }
  }
  return {
    ChatOpenAI: MockChatOpenAI,
  };
});

describe('ToolCallingWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBindTools.mockReturnValue({
      invoke: mockInvoke,
    });
  });

  it('should create a workflow instance', () => {
    const workflow = new ToolCallingWorkflow({
      modelName: 'openai/gpt-3.5-turbo',
      temperature: 0.7,
    });

    expect(workflow).toBeInstanceOf(ToolCallingWorkflow);
  });

  it('should return available tools', () => {
    const workflow = new ToolCallingWorkflow();
    const tools = workflow.getAvailableTools();

    expect(tools).toContain('calculator');
    expect(tools).toContain('get_weather');
    expect(tools).toContain('string_operations');
  });

  it('should have a run method', () => {
    const workflow = new ToolCallingWorkflow();
    expect(typeof workflow.run).toBe('function');
  });

  it('should throw error if API key is missing', () => {
    const originalEnv = process.env['OPENROUTER_API_KEY'];
    delete process.env['OPENROUTER_API_KEY'];

    expect(() => {
      new ToolCallingWorkflow({ apiKey: undefined });
    }).toThrow('OpenRouter API key is required');

    if (originalEnv) {
      process.env['OPENROUTER_API_KEY'] = originalEnv;
    }
  });
});
