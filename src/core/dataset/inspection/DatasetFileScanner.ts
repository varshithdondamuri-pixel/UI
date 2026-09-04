import * as fs from 'fs';
import * as path from 'path';
import {
  DatasetFileStats,
  DatasetInspectionLimits,
  DEFAULT_INSPECTION_LIMITS,
  FileCategory
} from './DatasetInspectionTypes';

export class DatasetFileScanner {
  private limits: DatasetInspectionLimits;

  constructor(limits: DatasetInspectionLimits = DEFAULT_INSPECTION_LIMITS) {
    this.limits = limits;
  }

  /**
   * Resolves existing absolute or relative dataset directory path.
   * Supports workspace paths like 'data set layer/datset/' or 'dataset/'.
   */
  public resolveDatasetPath(configuredPath: string, workspaceRoot: string = process.cwd()): string {
    const candidates = [
      path.resolve(workspaceRoot, configuredPath),
      path.resolve(workspaceRoot, 'data set layer/datset', configuredPath),
      path.resolve(workspaceRoot, 'data set layer/datset', path.basename(configuredPath)),
      path.resolve(workspaceRoot, 'dataset', path.basename(configuredPath)),
      path.resolve(workspaceRoot, 'datasets', path.basename(configuredPath))
    ];

    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        return cand;
      }
    }

    return path.resolve(workspaceRoot, configuredPath);
  }

  /**
   * Recursively scans dataset path without loading large files into memory.
   */
  public scanDirectory(targetPath: string): DatasetFileStats {
    const formatDistribution: Record<FileCategory, number> = {
      image: 0,
      json: 0,
      jsonl: 0,
      csv: 0,
      parquet: 0,
      html: 0,
      css: 0,
      code: 0,
      archive: 0,
      unknown: 0
    };

    const extensionDistribution: Record<string, number> = {};
    const sampleFileNames: string[] = [];

    let totalFiles = 0;
    let totalDirectories = 0;
    let totalBytes = 0;

    if (!fs.existsSync(targetPath)) {
      return {
        rootPath: targetPath,
        totalFiles: 0,
        totalDirectories: 0,
        totalBytes: 0,
        formatDistribution,
        extensionDistribution,
        sampleFileNames: []
      };
    }

    const traverse = (currentDir: string, depth: number = 0) => {
      if (totalFiles >= this.limits.maxFilesToInspect || depth > 8) {
        return;
      }

      try {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          if (totalFiles >= this.limits.maxFilesToInspect) break;

          const fullPath = path.join(currentDir, entry.name);

          if (entry.isDirectory()) {
            totalDirectories++;
            traverse(fullPath, depth + 1);
          } else if (entry.isFile()) {
            totalFiles++;

            let fileSize = 0;
            try {
              const stat = fs.statSync(fullPath);
              fileSize = stat.size;
              totalBytes += fileSize;
            } catch {
              // ignore unreadable stat
            }

            const ext = path.extname(entry.name).toLowerCase();
            extensionDistribution[ext] = (extensionDistribution[ext] || 0) + 1;

            const category = this.categorizeFile(entry.name, ext);
            formatDistribution[category] = (formatDistribution[category] || 0) + 1;

            if (sampleFileNames.length < 20) {
              const rel = path.relative(targetPath, fullPath);
              sampleFileNames.push(rel);
            }
          }
        }
      } catch {
        // Handle read error gracefully
      }
    };

    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      traverse(targetPath);
    } else if (stat.isFile()) {
      totalFiles = 1;
      totalBytes = stat.size;
      const ext = path.extname(targetPath).toLowerCase();
      extensionDistribution[ext] = 1;
      const category = this.categorizeFile(path.basename(targetPath), ext);
      formatDistribution[category] = 1;
      sampleFileNames.push(path.basename(targetPath));
    }

    return {
      rootPath: targetPath,
      totalFiles,
      totalDirectories,
      totalBytes,
      formatDistribution,
      extensionDistribution,
      sampleFileNames
    };
  }

  public categorizeFile(fileName: string, ext: string): FileCategory {
    const lowerName = fileName.toLowerCase();

    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp' || ext === '.gif' || ext === '.svg') {
      return 'image';
    }
    if (ext === '.json') {
      return 'json';
    }
    if (ext === '.jsonl') {
      return 'jsonl';
    }
    if (ext === '.csv' || ext === '.tsv') {
      return 'csv';
    }
    if (ext === '.parquet') {
      return 'parquet';
    }
    if (ext === '.html' || ext === '.htm') {
      return 'html';
    }
    if (ext === '.css') {
      return 'css';
    }
    if (ext === '.js' || ext === '.ts' || ext === '.jsx' || ext === '.tsx' || ext === '.py') {
      return 'code';
    }
    if (ext === '.tar' || ext === '.gz' || ext === '.tgz' || ext === '.zip' || lowerName.endsWith('.tar.gz')) {
      return 'archive';
    }

    return 'unknown';
  }
}
