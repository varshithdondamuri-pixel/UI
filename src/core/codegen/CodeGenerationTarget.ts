import { CodeGenTargetConfig } from './CodeGenerationTypes';

export interface CodeGenerationTarget {
  config: CodeGenTargetConfig;
  supportsFramework(framework: string): boolean;
  getDefaultExtension(): string;
  getComponentPath(componentName: string): string;
  getPagePath(pageName: string): string;
}

export class ReactTypeScriptTailwindTarget implements CodeGenerationTarget {
  public config: CodeGenTargetConfig = {
    id: 'react-ts-tailwind',
    name: 'React 18 + TypeScript + Tailwind CSS (Next.js App Router)',
    language: 'typescript',
    framework: 'nextjs',
    stylingSystem: 'tailwind',
    componentModel: 'functional',
    routingModel: 'app-router',
    assetModel: 'public-folder',
    useTypeScript: true
  };

  public supportsFramework(framework: string): boolean {
    return framework === 'react' || framework === 'nextjs';
  }

  public getDefaultExtension(): string {
    return '.tsx';
  }

  public getComponentPath(componentName: string): string {
    return `src/components/${componentName}.tsx`;
  }

  public getPagePath(pageName: string): string {
    return `src/pages/${pageName}.tsx`;
  }
}

export class FlutterTarget implements CodeGenerationTarget {
  public config: CodeGenTargetConfig = {
    id: 'flutter-dart',
    name: 'Flutter + Dart (Extensible Stub)',
    language: 'dart',
    framework: 'flutter',
    stylingSystem: 'vanilla-css',
    componentModel: 'functional',
    routingModel: 'flat',
    assetModel: 'public-folder',
    useTypeScript: false
  };

  public supportsFramework(framework: string): boolean {
    return framework === 'flutter';
  }

  public getDefaultExtension(): string {
    return '.dart';
  }

  public getComponentPath(componentName: string): string {
    return `lib/widgets/${componentName.toLowerCase()}.dart`;
  }

  public getPagePath(pageName: string): string {
    return `lib/screens/${pageName.toLowerCase()}.dart`;
  }
}

export class SwiftUITarget implements CodeGenerationTarget {
  public config: CodeGenTargetConfig = {
    id: 'swiftui-swift',
    name: 'SwiftUI + Swift (Extensible Stub)',
    language: 'swift',
    framework: 'swiftui',
    stylingSystem: 'vanilla-css',
    componentModel: 'functional',
    routingModel: 'flat',
    assetModel: 'public-folder',
    useTypeScript: false
  };

  public supportsFramework(framework: string): boolean {
    return framework === 'swiftui';
  }

  public getDefaultExtension(): string {
    return '.swift';
  }

  public getComponentPath(componentName: string): string {
    return `Views/${componentName}.swift`;
  }

  public getPagePath(pageName: string): string {
    return `Views/${pageName}View.swift`;
  }
}
