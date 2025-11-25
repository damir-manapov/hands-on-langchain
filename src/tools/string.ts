import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { CallbackManagerForToolRun } from '@langchain/core/callbacks/manager';
import type { RunnableConfig } from '@langchain/core/runnables';

// Type check: Ensure func signature matches what DynamicStructuredTool expects
type ExpectedFuncType = (
  input: unknown,
  runManager?: CallbackManagerForToolRun,
  config?: RunnableConfig
) => Promise<string>;

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

export const stringTool = new DynamicStructuredTool({
  name: 'string_operations',
  description: 'Performs string operations: uppercase, lowercase, reverse, length',
  schema: stringSchema,
  func: stringFunc,
});
