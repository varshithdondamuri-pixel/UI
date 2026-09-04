import { VisualDesignModel } from '../design/DesignTypes';
import { RenderTree } from '../rendering/RenderTree';
import { TypedEventBus } from '../events/EventBus';
import { CoreEvent } from '../../types';
import {
  CodeGenProjectResult,
  CodeGenTargetConfig,
  GeneratedFile,
  IRTree
} from './CodeGenerationTypes';
import { CodeGenerationTarget, ReactTypeScriptTailwindTarget } from './CodeGenerationTarget';
import { IntermediateRepresentationBuilder } from './IntermediateRepresentation';
import { TokenGenerator } from './TokenGenerator';
import { ComponentGenerator } from './ComponentGenerator';
import { LayoutGenerator } from './LayoutGenerator';
import { ProjectBuilder } from './ProjectBuilder';
import { CodeValidator } from './CodeValidator';
import { CodeFormatter } from './CodeFormatter';
import { CodeStatistics } from './CodeStatistics';
import { AssetGenerator } from './AssetGenerator';

export class CodeGenerationEngine {
  private irBuilder: IntermediateRepresentationBuilder;
  private tokenGen: TokenGenerator;
  private componentGen: ComponentGenerator;
  private layoutGen: LayoutGenerator;
  private projectBuilder: ProjectBuilder;
  private validator: CodeValidator;
  private formatter: CodeFormatter;
  private statistics: CodeStatistics;
  private assetGen: AssetGenerator;

  private currentTarget: CodeGenerationTarget;
  private lastResult: CodeGenProjectResult | null = null;

  constructor(private eventBus: TypedEventBus) {
    this.irBuilder = new IntermediateRepresentationBuilder();
    this.tokenGen = new TokenGenerator();
    this.componentGen = new ComponentGenerator();
    this.layoutGen = new LayoutGenerator();
    this.projectBuilder = new ProjectBuilder();
    this.validator = new CodeValidator();
    this.formatter = new CodeFormatter();
    this.statistics = new CodeStatistics();
    this.assetGen = new AssetGenerator();
    this.currentTarget = new ReactTypeScriptTailwindTarget();
  }

  public setTarget(target: CodeGenerationTarget): void {
    this.currentTarget = target;
  }

  public getTarget(): CodeGenerationTarget {
    return this.currentTarget;
  }

  public getLastResult(): CodeGenProjectResult | null {
    return this.lastResult;
  }

  public async generate(
    visualModel: VisualDesignModel | null,
    renderTree: RenderTree | null
  ): Promise<CodeGenProjectResult> {
    const startTime = Date.now();
    const targetConfig: CodeGenTargetConfig = this.currentTarget.config;

    this.eventBus.emit(CoreEvent.CODEGEN_STARTED, {
      targetId: targetConfig.id,
      timestamp: startTime
    });

    try {
      // ── Step 1: Build IR from VisualDesignModel + RenderTree ──────────────
      const irTree: IRTree = this.irBuilder.buildIR(visualModel, renderTree);

      this.eventBus.emit(CoreEvent.CODEGEN_IR_CREATED, {
        irTree,
        totalNodes: irTree.totalNodeCount,
        timestamp: Date.now()
      });

      // ── Step 2: Generate all file sections ────────────────────────────────
      const files: GeneratedFile[] = [];

      // Design tokens
      const tokenFiles = this.tokenGen.generateTokens(visualModel);
      files.push(...tokenFiles);

      // Asset placeholders
      files.push(this.assetGen.generateAssetPlaceholderFile());

      // Components
      const componentFiles = this.componentGen.generateAllComponents();
      for (const cf of componentFiles) {
        files.push(cf);
        this.eventBus.emit(CoreEvent.CODEGEN_COMPONENT_CREATED, {
          componentName: cf.path.split('/').pop()?.replace('.tsx', '') || cf.path,
          filePath: cf.path
        });
      }

      // Layout pages
      const pageFiles = this.layoutGen.generatePageLayouts(irTree);
      files.push(...pageFiles);

      // Project scaffolding
      const projectFiles = this.projectBuilder.buildProjectFiles();
      files.push(...projectFiles);

      // ── Step 3: Format ────────────────────────────────────────────────────
      const formattedFiles = this.formatter.formatAll(files);

      // ── Step 4: Validate ──────────────────────────────────────────────────
      this.eventBus.emit(CoreEvent.CODEGEN_VALIDATION_STARTED, { timestamp: Date.now() });

      const validation = this.validator.validate(formattedFiles);

      this.eventBus.emit(CoreEvent.CODEGEN_VALIDATION_FINISHED, {
        validation,
        timestamp: Date.now()
      });

      // ── Step 5: Compute stats & assemble result ───────────────────────────
      const executionTimeMs = Date.now() - startTime;
      const stats = this.statistics.computeStats(
        formattedFiles,
        executionTimeMs,
        validation,
        targetConfig.id
      );

      const result: CodeGenProjectResult = {
        id: `codegen_${Date.now()}`,
        target: targetConfig,
        irTree,
        files: formattedFiles,
        validation,
        stats,
        timestamp: Date.now()
      };

      this.lastResult = result;

      this.eventBus.emit(CoreEvent.CODEGEN_FINISHED, {
        project: result,
        executionTimeMs,
        timestamp: Date.now()
      });

      return result;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : String(err);
      this.eventBus.emit(CoreEvent.CODEGEN_FAILED, {
        error: message,
        timestamp: Date.now()
      });
      throw err;
    }
  }
}
