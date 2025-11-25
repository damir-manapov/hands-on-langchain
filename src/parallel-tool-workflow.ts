import { ChatOpenAI } from '@langchain/openai';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { HumanMessage, ToolMessage, BaseMessage } from '@langchain/core/messages';
import { createOpenRouterModel, type ModelConfig } from './model-utils.js';
import { getDefaultTools } from './tools/index.js';

export type ParallelToolWorkflowConfig = ModelConfig;

export interface ParallelToolWorkflowInput {
  question: string;
}

export class ParallelToolCallingWorkflow {
  private readonly model: ChatOpenAI;
  private readonly tools: DynamicStructuredTool[];
  private readonly toolMap: Map<string, DynamicStructuredTool>;

  constructor(config?: ParallelToolWorkflowConfig) {
    this.model = createOpenRouterModel(config);

    this.tools = getDefaultTools();
    this.toolMap = new Map(this.tools.map((tool) => [tool.name, tool]));
  }

  async run(input: ParallelToolWorkflowInput): Promise<string> {
    console.log(`[Parallel Tool Workflow] Starting workflow with question: "${input.question}"`);
    const modelWithTools = this.model.bindTools(this.tools);
    const messages: BaseMessage[] = [new HumanMessage(input.question)];

    const maxIterations = 5;
    let iteration = 0;

    while (iteration < maxIterations) {
      console.log(
        `[Parallel Tool Workflow] Iteration ${String(iteration + 1)}/${String(maxIterations)}`
      );
      const response = await modelWithTools.invoke(messages);

      // If no tool calls, return the response
      if (!response.tool_calls || response.tool_calls.length === 0) {
        console.log(`[Parallel Tool Workflow] No tool calls needed, returning response`);
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
        `[Parallel Tool Workflow] Model requested ${String(response.tool_calls.length)} tool call(s)`
      );

      // Log details of requested tool calls
      for (const toolCall of response.tool_calls) {
        if (toolCall.name && toolCall.id) {
          const args = toolCall.args as Record<string, unknown>;
          console.log(`[Parallel Tool Workflow]   - ${toolCall.name}(${JSON.stringify(args)})`);
        }
      }

      // Execute tool calls in parallel
      const toolCallPromises = response.tool_calls.map(async (toolCall) => {
        if (!toolCall.name || !toolCall.id) {
          return null;
        }

        const tool = this.toolMap.get(toolCall.name);
        if (!tool) {
          console.error(`[Parallel Tool Workflow] Tool "${toolCall.name}" not found`);
          return {
            toolCallId: toolCall.id,
            content: `Error: Tool ${toolCall.name} not found`,
          };
        }

        const args = toolCall.args as Record<string, unknown>;
        console.log(`[Parallel Tool Workflow] Calling tool: ${toolCall.name}`);
        console.log(`[Parallel Tool Workflow] Tool arguments:`, JSON.stringify(args, null, 2));

        try {
          const toolResult = (await tool.invoke(args)) as string;
          console.log(`[Parallel Tool Workflow] Tool "${toolCall.name}" returned:`, toolResult);
          return {
            toolCallId: toolCall.id,
            content: toolResult,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(
            `[Parallel Tool Workflow] Error executing tool "${toolCall.name}":`,
            errorMessage
          );
          return {
            toolCallId: toolCall.id,
            content: `Error executing tool: ${errorMessage}`,
          };
        }
      });

      // Wait for all tool calls to complete in parallel
      const toolResults = await Promise.all(toolCallPromises);

      // Add all tool results to messages
      for (const result of toolResults) {
        if (result) {
          messages.push(
            new ToolMessage({
              content: result.content,
              tool_call_id: result.toolCallId,
            })
          );
        }
      }

      iteration++;
      console.log(`[Parallel Tool Workflow] Completed iteration ${String(iteration)}`);
    }

    console.warn(`[Parallel Tool Workflow] Maximum iterations (${String(maxIterations)}) reached`);
    return 'Maximum iterations reached. Please try a simpler question.';
  }

  getAvailableTools(): string[] {
    return this.tools.map((tool) => tool.name);
  }
}
