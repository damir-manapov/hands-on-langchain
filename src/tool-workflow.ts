import { ChatOpenAI } from '@langchain/openai';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { HumanMessage, ToolMessage, BaseMessage } from '@langchain/core/messages';
import type { CallbackManagerForToolRun } from '@langchain/core/callbacks/manager';
import type { RunnableConfig } from '@langchain/core/runnables';
import { createOpenRouterModel, type ModelConfig } from './model-utils.js';

export type ToolWorkflowConfig = ModelConfig;

export interface ToolWorkflowInput {
  question: string;
}

// Simple calculator tool
const calculatorSchema = z.object({
  operation: z
    .enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('The arithmetic operation to perform'),
  a: z.number().describe('First number'),
  b: z.number().describe('Second number'),
});

// Type check: Ensure func signature matches what DynamicStructuredTool expects
type CalculatorInput = z.infer<typeof calculatorSchema>;
type ExpectedFuncType = (
  input: unknown,
  runManager?: CallbackManagerForToolRun,
  config?: RunnableConfig
) => Promise<string>;

const calculatorFunc: ExpectedFuncType = async (input: unknown) => {
  const { operation, a, b } = input as CalculatorInput;
  switch (operation) {
    case 'add':
      return Promise.resolve(String(a + b));
    case 'subtract':
      return Promise.resolve(String(a - b));
    case 'multiply':
      return Promise.resolve(String(a * b));
    case 'divide':
      if (b === 0) {
        return Promise.resolve('Error: Division by zero');
      }
      return Promise.resolve(String(a / b));
    default:
      return Promise.resolve('Error: Unknown operation');
  }
};

const calculatorTool = new DynamicStructuredTool({
  name: 'calculator',
  description: 'Performs basic arithmetic operations: add, subtract, multiply, divide',
  schema: calculatorSchema,
  func: calculatorFunc,
});

// Weather tool (mock)
const weatherSchema = z.object({
  city: z.string().describe('The city name'),
});

type WeatherInput = z.infer<typeof weatherSchema>;

const weatherFunc: ExpectedFuncType = async (input: unknown) => {
  const { city } = input as WeatherInput;
  const mockWeather: Record<string, string> = {
    'New York': 'Sunny, 72°F',
    London: 'Cloudy, 15°C',
    Tokyo: 'Rainy, 18°C',
    Paris: 'Partly cloudy, 20°C',
  };
  return Promise.resolve(mockWeather[city] ?? `Weather data not available for ${city}`);
};

const weatherTool = new DynamicStructuredTool({
  name: 'get_weather',
  description: 'Gets the current weather for a given city',
  schema: weatherSchema,
  func: weatherFunc,
});

// String manipulation tool
const stringSchema = z.object({
  operation: z
    .enum(['uppercase', 'lowercase', 'reverse', 'length'])
    .describe('The string operation to perform'),
  text: z.string().describe('The text to process'),
});

type StringInput = z.infer<typeof stringSchema>;

const stringFunc: ExpectedFuncType = async (input: unknown) => {
  const { operation, text } = input as StringInput;
  switch (operation) {
    case 'uppercase':
      return Promise.resolve(text.toUpperCase());
    case 'lowercase':
      return Promise.resolve(text.toLowerCase());
    case 'reverse':
      return Promise.resolve(text.split('').reverse().join(''));
    case 'length':
      return Promise.resolve(String(text.length));
    default:
      return Promise.resolve('Error: Unknown operation');
  }
};

const stringTool = new DynamicStructuredTool({
  name: 'string_operations',
  description: 'Performs string operations: uppercase, lowercase, reverse, length',
  schema: stringSchema,
  func: stringFunc,
});

export class ToolCallingWorkflow {
  private readonly model: ChatOpenAI;
  private readonly tools: DynamicStructuredTool[];
  private readonly toolMap: Map<string, DynamicStructuredTool>;

  constructor(config?: ToolWorkflowConfig) {
    this.model = createOpenRouterModel(config);

    this.tools = [calculatorTool, weatherTool, stringTool];
    this.toolMap = new Map(this.tools.map((tool) => [tool.name, tool]));
  }

  async run(input: ToolWorkflowInput): Promise<string> {
    console.log(`[Tool Workflow] Starting workflow with question: "${input.question}"`);
    const modelWithTools = this.model.bindTools(this.tools);
    const messages: BaseMessage[] = [new HumanMessage(input.question)];

    const maxIterations = 5;
    let iteration = 0;

    while (iteration < maxIterations) {
      console.log(`[Tool Workflow] Iteration ${String(iteration + 1)}/${String(maxIterations)}`);
      const response = await modelWithTools.invoke(messages);

      // If no tool calls, return the response
      if (!response.tool_calls || response.tool_calls.length === 0) {
        console.log(`[Tool Workflow] No tool calls needed, returning response`);
        const content = response.content;
        if (typeof content === 'string') {
          return content;
        }
        if (Array.isArray(content)) {
          return content.map((c) => (typeof c === 'string' ? c : JSON.stringify(c))).join('\n');
        }
        return JSON.stringify(content);
      }

      // Add the assistant's response to messages
      messages.push(response);

      console.log(
        `[Tool Workflow] Model requested ${String(response.tool_calls.length)} tool call(s)`
      );

      // Log details of requested tool calls
      for (const toolCall of response.tool_calls) {
        if (toolCall.name && toolCall.id) {
          const args = toolCall.args as Record<string, unknown>;
          console.log(`[Tool Workflow]   - ${toolCall.name}(${JSON.stringify(args)})`);
        }
      }

      // Execute tool calls
      for (const toolCall of response.tool_calls) {
        if (!toolCall.name || !toolCall.id) {
          continue;
        }

        const tool = this.toolMap.get(toolCall.name);
        if (!tool) {
          console.error(`[Tool Workflow] Tool "${toolCall.name}" not found`);
          messages.push(
            new ToolMessage({
              content: `Error: Tool ${toolCall.name} not found`,
              tool_call_id: toolCall.id,
            })
          );
          continue;
        }

        const args = toolCall.args as Record<string, unknown>;
        console.log(`[Tool Workflow] Calling tool: ${toolCall.name}`);
        console.log(`[Tool Workflow] Tool arguments:`, JSON.stringify(args, null, 2));

        try {
          const toolResult = (await tool.invoke(args)) as string;
          console.log(`[Tool Workflow] Tool "${toolCall.name}" returned:`, toolResult);
          messages.push(
            new ToolMessage({
              content: toolResult,
              tool_call_id: toolCall.id,
            })
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`[Tool Workflow] Error executing tool "${toolCall.name}":`, errorMessage);
          messages.push(
            new ToolMessage({
              content: `Error executing tool: ${errorMessage}`,
              tool_call_id: toolCall.id,
            })
          );
        }
      }

      iteration++;
      console.log(`[Tool Workflow] Completed iteration ${String(iteration)}`);
    }

    console.warn(`[Tool Workflow] Maximum iterations (${String(maxIterations)}) reached`);
    return 'Maximum iterations reached. Please try a simpler question.';
  }

  getAvailableTools(): string[] {
    return this.tools.map((tool) => tool.name);
  }
}
