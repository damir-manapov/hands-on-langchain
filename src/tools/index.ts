import { DynamicStructuredTool } from '@langchain/core/tools';
import { calculatorTool } from './calculator.js';
import { weatherTool } from './weather.js';
import { stringTool } from './string.js';

export { calculatorTool } from './calculator.js';
export { weatherTool } from './weather.js';
export { stringTool } from './string.js';

/**
 * Get all available tools
 */
export function getDefaultTools(): DynamicStructuredTool[] {
  return [calculatorTool, weatherTool, stringTool];
}
