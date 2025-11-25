# Hands-on LangChain

Project for getting familiar with LangChain.

## Author

Damir Manapov

## License

MIT

## Stack

- TypeScript
- pnpm
- Vitest
- tsx
- ESLint
- Prettier
- Gitleaks

## Setup

1. Install pnpm (if not already installed):

   ```bash
   npm install -g pnpm
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Scripts

- `pnpm run build` - Type check without emitting files
- `pnpm run test` - Run tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run lint` - Check linting
- `pnpm run lint:fix` - Fix linting issues
- `pnpm run format` - Format code
- `pnpm run format:check` - Check formatting
- `pnpm run gitleaks` - Check for secrets

## Checks

- `./check.sh` - Runs formatting (fixing issues), lint, build, gitleaks, and tests
- `./health.sh` - Checks for outdated dependencies and vulnerabilities
- `./all-checks.sh` - Runs both check.sh and health.sh

## LangChain Workflow

The project includes a simple LangChain workflow example (`src/workflow.ts`) that demonstrates:

- Creating prompt templates with system and human messages
- Setting up a ChatOpenAI model
- Building a chain with prompt → model → output parser
- Running the workflow with custom inputs

### Usage Example

```typescript
import { SimpleLangChainWorkflow } from './workflow.js';

const workflow = new SimpleLangChainWorkflow({
  modelName: 'openai/gpt-3.5-turbo', // or 'anthropic/claude-3-haiku', etc.
  temperature: 0.7,
});

const result = await workflow.run({
  topic: 'LangChain',
  question: 'What is LangChain?',
});

console.log(result);
```

### Running the Example

1. Get your OpenRouter API key from [openrouter.ai](https://openrouter.ai)
2. Set the environment variable:
   ```bash
   export OPENROUTER_API_KEY='your-openrouter-api-key-here'
   ```
3. Optionally set HTTP referer (for usage tracking):
   ```bash
   export OPENROUTER_HTTP_REFERER='https://your-domain.com'
   ```
4. Run the example:
   ```bash
   pnpm tsx src/example.ts
   ```

### Why OpenRouter?

- **Access to 400+ models** from multiple providers (OpenAI, Anthropic, Google, Meta, etc.)
- **Easy model switching** without changing code
- **Automatic failover** for high availability
- **Cost optimization** through intelligent routing
- **OpenAI-compatible API** for easy migration

## Notes

- ESLint is configured to error on usage of `any` type and unsafe operations
- TypeScript compiler will show warnings for deprecated APIs (marked with `@deprecated` JSDoc tags)
- Note: `eslint-plugin-deprecation` doesn't support ESLint 9 yet, so runtime deprecation checking via ESLint is not available
