import { GeneratedFile, CodeGenValidationIssue, CodeGenValidationResult } from './CodeGenerationTypes';

export class CodeValidator {
  public validate(files: GeneratedFile[]): CodeGenValidationResult {
    const issues: CodeGenValidationIssue[] = [];

    for (const file of files) {
      this.validateFile(file, issues);
    }

    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const a11yIssues = issues.filter((i) => i.code.startsWith('A11Y')).length;

    // Score: start at 100, deduct for errors and warnings
    const score = Math.max(0, Math.min(100, 100 - errorCount * 15 - warningCount * 3 - a11yIssues * 5));

    return {
      isValid: errorCount === 0,
      score,
      issues,
      typeScriptErrors: issues.filter((i) => i.code.startsWith('TS')).length,
      missingImports: issues.filter((i) => i.code === 'MISSING_IMPORT').length,
      accessibilityIssues: a11yIssues
    };
  }

  private validateFile(file: GeneratedFile, issues: CodeGenValidationIssue[]): void {
    if (!file.content || file.content.trim().length === 0) {
      issues.push(this.issue('EMPTY_FILE', `File ${file.path} is empty`, 'error', file.path));
      return;
    }

    if (file.language === 'typescript' && file.type === 'component') {
      this.validateComponent(file, issues);
    }

    if (file.language === 'json') {
      this.validateJSON(file, issues);
    }

    if (file.language === 'css') {
      this.validateCSS(file, issues);
    }
  }

  private validateComponent(file: GeneratedFile, issues: CodeGenValidationIssue[]): void {
    const content = file.content;

    // Must import React
    if (!content.includes("from 'react'") && !content.includes('from "react"')) {
      issues.push(this.issue('MISSING_IMPORT', `Missing React import in ${file.path}`, 'error', file.path));
    }

    // Must have export
    if (!content.includes('export function') && !content.includes('export default')) {
      issues.push(this.issue('MISSING_EXPORT', `No exported component found in ${file.path}`, 'error', file.path));
    }

    // Encourage aria labels
    if (
      !content.includes('aria-label') &&
      !content.includes('aria-labelledby') &&
      !content.includes('role=') &&
      file.type === 'component'
    ) {
      issues.push(this.issue('A11Y_MISSING_ARIA', `Consider adding aria-label or role to ${file.path}`, 'warning', file.path));
    }

    // Warn on any dangerouslySetInnerHTML usage
    if (content.includes('dangerouslySetInnerHTML')) {
      issues.push(this.issue('SECURITY_INNER_HTML', `Unsafe dangerouslySetInnerHTML in ${file.path}`, 'warning', file.path));
    }

    // Missing focus styles hint
    if (content.includes('<button') && !content.includes('focus-visible')) {
      issues.push(this.issue('A11Y_FOCUS_RING', `Button in ${file.path} may be missing focus-visible styles`, 'info', file.path));
    }

    // Detect generic any usage (TypeScript)
    const anyCount = (content.match(/: any[^[]*/g) || []).length;
    if (anyCount > 3) {
      issues.push(this.issue('TS_ANY_OVERUSE', `Excessive 'any' types in ${file.path} (${anyCount} occurrences)`, 'warning', file.path));
    }
  }

  private validateJSON(file: GeneratedFile, issues: CodeGenValidationIssue[]): void {
    try {
      JSON.parse(file.content);
    } catch {
      issues.push(this.issue('INVALID_JSON', `Invalid JSON in ${file.path}`, 'error', file.path));
    }
  }

  private validateCSS(file: GeneratedFile, issues: CodeGenValidationIssue[]): void {
    const content = file.content;
    // Check for unclosed braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push(this.issue('CSS_BRACE_MISMATCH', `Mismatched braces in ${file.path}`, 'warning', file.path));
    }
  }

  private issue(
    code: string,
    message: string,
    severity: 'error' | 'warning' | 'info',
    filePath?: string
  ): CodeGenValidationIssue {
    return {
      id: `${code}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      code,
      message,
      severity,
      filePath
    };
  }
}
