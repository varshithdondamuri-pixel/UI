import { GeneratedFile } from './CodeGenerationTypes';

export class CodeFormatter {
  public formatFile(file: GeneratedFile): GeneratedFile {
    if (file.language === 'typescript' || file.language === 'javascript') {
      return { ...file, content: this.formatTypeScript(file.content) };
    }
    if (file.language === 'css') {
      return { ...file, content: this.formatCSS(file.content) };
    }
    if (file.language === 'json') {
      return { ...file, content: this.formatJSON(file.content) };
    }
    return file;
  }

  public formatAll(files: GeneratedFile[]): GeneratedFile[] {
    return files.map((f) => this.formatFile(f));
  }

  private formatTypeScript(content: string): string {
    const lines = content.split('\n');

    // Separate import block, blank lines, and body
    const importLines: string[] = [];
    const bodyLines: string[] = [];
    let inImportBlock = true;

    for (const line of lines) {
      if (inImportBlock && (line.startsWith('import ') || line.trim() === '')) {
        if (line.startsWith('import ')) {
          importLines.push(line);
        }
      } else {
        inImportBlock = false;
        bodyLines.push(line);
      }
    }

    // Sort imports: react first, then alphabetically
    const sortedImports = this.sortImports(importLines);

    // Normalize indentation in JSX (tabs → 2 spaces)
    const normalizedBody = bodyLines
      .map((line) => line.replace(/\t/g, '  '))
      .join('\n');

    return [sortedImports.join('\n'), '', normalizedBody].join('\n').trimEnd() + '\n';
  }

  private sortImports(importLines: string[]): string[] {
    const reactImports = importLines.filter((l) => l.includes("from 'react'") || l.includes('from "react"'));
    const lucideImports = importLines.filter((l) => l.includes('lucide-react'));
    const relativeImports = importLines.filter(
      (l) => !l.includes("from 'react'") && !l.includes('lucide-react') && (l.includes("from '..") || l.includes("from '."))
    );
    const packageImports = importLines.filter(
      (l) =>
        !reactImports.includes(l) &&
        !lucideImports.includes(l) &&
        !relativeImports.includes(l)
    );

    return [
      ...reactImports,
      ...lucideImports.sort(),
      ...packageImports.sort(),
      ...relativeImports.sort()
    ].filter(Boolean);
  }

  private formatCSS(content: string): string {
    // Normalise indentation to 2 spaces
    return content
      .split('\n')
      .map((line) => line.replace(/\t/g, '  '))
      .join('\n')
      .trimEnd() + '\n';
  }

  private formatJSON(content: string): string {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2) + '\n';
    } catch {
      return content;
    }
  }
}
