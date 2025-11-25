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

export const weatherTool = new DynamicStructuredTool({
  name: 'get_weather',
  description: 'Gets the current weather for a given city',
  schema: weatherSchema,
  func: weatherFunc,
});
