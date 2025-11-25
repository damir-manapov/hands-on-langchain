export function hello(): string {
  return 'Hello, LangChain!';
}

export { SimpleLangChainWorkflow } from './workflow.js';
export type { WorkflowInput, WorkflowConfig } from './workflow.js';

export { ToolCallingWorkflow } from './tool-workflow.js';
export type { ToolWorkflowInput, ToolWorkflowConfig } from './tool-workflow.js';

export { ParallelToolCallingWorkflow } from './parallel-tool-workflow.js';
export type {
  ParallelToolWorkflowInput,
  ParallelToolWorkflowConfig,
} from './parallel-tool-workflow.js';

export { createOpenRouterModel, getApiKey } from './model-utils.js';
export type { ModelConfig } from './model-utils.js';

export { calculatorTool, weatherTool, stringTool, getDefaultTools } from './tools/index.js';
