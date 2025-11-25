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

const calculatorSchema = z.object({
  operation: z
    .enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('The arithmetic operation to perform'),
  a: z.number().describe('First number'),
  b: z.number().describe('Second number'),
});

type CalculatorInput = z.infer<typeof calculatorSchema>;

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

export const calculatorTool = new DynamicStructuredTool({
  name: 'calculator',
  description: 'Performs basic arithmetic operations: add, subtract, multiply, divide',
  schema: calculatorSchema,
  func: calculatorFunc,
});
