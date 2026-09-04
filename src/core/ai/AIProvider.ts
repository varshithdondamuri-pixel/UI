import { AIContext, AIPrompt, AIProviderCapabilities, AIProviderConfig, AIProviderResponse, AIRequestOptions } from './AITypes';

export interface AIProvider {
  id: string;
  name: string;
  config: AIProviderConfig;
  capabilities: AIProviderCapabilities;

  isAvailable(): boolean;
  sendRequest(
    prompt: AIPrompt,
    context: AIContext,
    options?: AIRequestOptions
  ): Promise<AIProviderResponse>;
}
