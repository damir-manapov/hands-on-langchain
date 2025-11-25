export function hello(): string {
  return 'Hello, LangChain!';
}

export { SimpleLangChainWorkflow } from './workflow.js';
export type { WorkflowInput, WorkflowConfig } from './workflow.js';

export { ToolCallingWorkflow } from './tool-workflow.js';
export type { ToolWorkflowInput, ToolWorkflowConfig } from './tool-workflow.js';
