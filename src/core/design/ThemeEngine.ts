import { ThemeMetadata, ThemeType } from './DesignTypes';

export class ThemeEngine {
  private themes: Map<ThemeType, ThemeMetadata> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.themes.set('light', {
      id: 'light',
      name: 'Light',
      mode: 'light',
      description: 'Clean, high-brightness surface palette suitable for daytime productivity.'
    });

    this.themes.set('dark', {
      id: 'dark',
      name: 'Dark',
      mode: 'dark',
      description: 'Deep midnight tones engineered to reduce eye strain and highlight accent elements.'
    });

    this.themes.set('high-contrast', {
      id: 'high-contrast',
      name: 'High Contrast',
      mode: 'high-contrast',
      description: 'Maximum contrast ratios optimized for extreme legibility and accessibility.'
    });

    this.themes.set('neutral', {
      id: 'neutral',
      name: 'Neutral',
      mode: 'light',
      description: 'Muted greyscale surface balance free from warm or cool color bias.'
    });

    this.themes.set('warm', {
      id: 'warm',
      name: 'Warm',
      mode: 'light',
      description: 'Subtle amber and slate undertones conveying approachability and comfort.'
    });

    this.themes.set('cool', {
      id: 'cool',
      name: 'Cool',
      mode: 'dark',
      description: 'Icy blue-grey backdrop with crisp oceanic highlights.'
    });
  }

  public getTheme(id: ThemeType): ThemeMetadata {
    return this.themes.get(id) || this.themes.get('dark')!;
  }

  public getAllThemes(): ThemeMetadata[] {
    return Array.from(this.themes.values());
  }
}
