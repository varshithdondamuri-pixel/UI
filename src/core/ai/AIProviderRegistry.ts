import { AIProvider } from './AIProvider';
import { GeminiProvider } from './GeminiProvider';
import { MockProvider } from './MockProvider';

export class AIProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();
  private activeProviderId: string = 'mock-provider';

  constructor() {
    // Register default providers
    const mock = new MockProvider();
    const gemini = new GeminiProvider();

    this.registerProvider(mock);
    this.registerProvider(gemini);
    this.activeProviderId = mock.id;
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  public unregisterProvider(providerId: string): boolean {
    if (this.providers.has(providerId)) {
      this.providers.delete(providerId);
      if (this.activeProviderId === providerId) {
        const first = Array.from(this.providers.keys())[0];
        if (first) {
          this.activeProviderId = first;
        }
      }
      return true;
    }
    return false;
  }

  public getProvider(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  public getActiveProvider(): AIProvider {
    const provider = this.providers.get(this.activeProviderId);
    if (provider && provider.isAvailable()) {
      return provider;
    }
    // Fallback to any available provider or mock
    for (const p of this.providers.values()) {
      if (p.isAvailable()) {
        return p;
      }
    }
    return new MockProvider();
  }

  public setActiveProvider(providerId: string): boolean {
    if (this.providers.has(providerId)) {
      this.activeProviderId = providerId;
      return true;
    }
    return false;
  }

  public listProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  public getActiveProviderId(): string {
    return this.activeProviderId;
  }
}
