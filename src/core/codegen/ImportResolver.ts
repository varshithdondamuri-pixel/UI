export interface ImportGroup {
  react: string[];
  lucide: string[];
  tokens: string[];
  components: string[];
  external: string[];
  assets: string[];
}

export class ImportResolver {
  private groups: ImportGroup = {
    react: [],
    lucide: [],
    tokens: [],
    components: [],
    external: [],
    assets: []
  };

  public reset(): void {
    this.groups = {
      react: [],
      lucide: [],
      tokens: [],
      components: [],
      external: [],
      assets: []
    };
  }

  public addReactImport(namedExport: string): void {
    if (!this.groups.react.includes(namedExport)) {
      this.groups.react.push(namedExport);
    }
  }

  public addLucideIcon(iconName: string): void {
    if (!this.groups.lucide.includes(iconName)) {
      this.groups.lucide.push(iconName);
    }
  }

  public addTokenImport(namedExport: string): void {
    if (!this.groups.tokens.includes(namedExport)) {
      this.groups.tokens.push(namedExport);
    }
  }

  public addComponentImport(namedExport: string): void {
    if (!this.groups.components.includes(namedExport)) {
      this.groups.components.push(namedExport);
    }
  }

  public addExternalImport(namedExport: string): void {
    if (!this.groups.external.includes(namedExport)) {
      this.groups.external.push(namedExport);
    }
  }

  /** Render ordered, deduplicated import block for a component file */
  public renderImportBlock(_componentName?: string): string {
    const lines: string[] = [];

    const reactExports = ['React', ...this.groups.react].filter(Boolean);
    lines.push(`import ${reactExports.includes('React') ? reactExports.join(', ').replace('React', 'React').replace(', React', '') : 'React, { ' + this.groups.react.join(', ') + ' }'} from 'react';`);

    if (this.groups.react.length === 0) {
      lines[0] = `import React from 'react';`;
    } else {
      const named = this.groups.react.join(', ');
      lines[0] = `import React, { ${named} } from 'react';`;
    }

    if (this.groups.lucide.length > 0) {
      const sorted = [...this.groups.lucide].sort();
      lines.push(`import { ${sorted.join(', ')} } from 'lucide-react';`);
    }

    if (this.groups.tokens.length > 0) {
      const sorted = [...this.groups.tokens].sort();
      lines.push(`import { ${sorted.join(', ')} } from '../tokens';`);
    }

    if (this.groups.components.length > 0) {
      for (const comp of [...this.groups.components].sort()) {
        lines.push(`import { ${comp} } from './${comp}';`);
      }
    }

    if (this.groups.assets.length > 0) {
      for (const asset of this.groups.assets) {
        lines.push(`import { ${asset} } from '../assets/placeholders';`);
      }
    }

    if (this.groups.external.length > 0) {
      for (const ext of this.groups.external) {
        lines.push(`import ${ext};`);
      }
    }

    return lines.join('\n');
  }
}
