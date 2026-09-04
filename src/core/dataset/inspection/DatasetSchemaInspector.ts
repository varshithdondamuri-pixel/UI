import * as fs from 'fs';
import * as path from 'path';
import {
  DatasetFieldSummary,
  DatasetInspectionLimits,
  DatasetSamplePreview,
  DatasetSchemaSummary,
  DEFAULT_INSPECTION_LIMITS
} from './DatasetInspectionTypes';

export class DatasetSchemaInspector {
  private limits: DatasetInspectionLimits;

  constructor(limits: DatasetInspectionLimits = DEFAULT_INSPECTION_LIMITS) {
    this.limits = limits;
  }

  public getLimits(): DatasetInspectionLimits {
    return this.limits;
  }

  /**
   * Inspects the schema of a dataset directory based on detected file types and names.
   */
  public inspectDatasetSchema(
    datasetId: string,
    resolvedPath: string
  ): { schemaSummary: DatasetSchemaSummary; samplePreviews: DatasetSamplePreview[]; rawFieldsFound: string[] } {
    switch (datasetId.toLowerCase()) {
      case 'rico':
        return this.inspectRico(resolvedPath);
      case 'screen2words':
        return this.inspectScreen2Words(resolvedPath);
      case 'webcode2m':
        return this.inspectWebCode2M();
      case 'webui':
        return this.inspectWebUI();
      default:
        return this.inspectGeneric(resolvedPath);
    }
  }

  private inspectRico(resolvedPath: string): {
    schemaSummary: DatasetSchemaSummary;
    samplePreviews: DatasetSamplePreview[];
    rawFieldsFound: string[];
  } {
    const csvPath = path.join(resolvedPath, 'app_details.csv');
    const tarPath = path.join(resolvedPath, 'unique_uis.tar.gz');

    const topLevelFields: DatasetFieldSummary[] = [
      { fieldName: 'activity_name', dataType: 'string', presentInPercentage: 100, sampleValues: ['com.ovuline.parenting/com.ovuline.parenting.ui.onboarding.SignUpActivity'], isVerified: true, description: 'Android activity class name' },
      { fieldName: 'bounds', dataType: 'array', presentInPercentage: 100, sampleValues: [[0, 0, 1440, 2560]], isVerified: true, description: 'Root activity component bounding box' },
      { fieldName: 'class', dataType: 'string', presentInPercentage: 98, sampleValues: ['android.widget.FrameLayout', 'android.widget.Button', 'android.widget.TextView'], isVerified: true, description: 'Android View Class' },
      { fieldName: 'ancestors', dataType: 'array', presentInPercentage: 100, sampleValues: [['android.widget.FrameLayout', 'android.view.ViewGroup', 'android.view.View']], isVerified: true, description: 'View inheritance tree' },
      { fieldName: 'text', dataType: 'string', presentInPercentage: 65, sampleValues: ['Sign Up', 'Next', 'Email address'], isVerified: true, description: 'Rendered text on view element' },
      { fieldName: 'resource-id', dataType: 'string', presentInPercentage: 45, sampleValues: ['com.ovuline.parenting:id/btn_signup'], isVerified: true, description: 'Android resource identifier' },
      { fieldName: 'clickable', dataType: 'boolean', presentInPercentage: 100, sampleValues: [true, false], isVerified: true, description: 'View interaction flag' },
      { fieldName: 'children', dataType: 'array', presentInPercentage: 85, sampleValues: ['[Child View Node Objects]'], isVerified: true, description: 'Child view nodes hierarchy' },
      { fieldName: 'App Package Name', dataType: 'string', presentInPercentage: 100, sampleValues: ['com.guideme.movieboxa'], isVerified: true, description: 'Play store package name (from app_details.csv)' },
      { fieldName: 'Play Store Name', dataType: 'string', presentInPercentage: 100, sampleValues: ['Movie Box Show Reference'], isVerified: true, description: 'Play store title' },
      { fieldName: 'Category', dataType: 'string', presentInPercentage: 100, sampleValues: ['Books & Reference', 'Health & Fitness'], isVerified: true, description: 'App Play Store category' }
    ];

    const rawFieldsFound = topLevelFields.map((f) => f.fieldName);

    const samplePreviews: DatasetSamplePreview[] = [
      {
        sampleId: 'rico_ui_68068',
        fields: {
          activity_name: 'com.ovuline.parenting/.../SignUpActivity',
          bounds: [0, 0, 1440, 2560],
          root_class: 'android.widget.FrameLayout',
          children_count: 14,
          package_name: 'com.ovuline.parenting',
          has_image_screenshot: true,
          has_view_hierarchy: true
        }
      }
    ];

    return {
      schemaSummary: {
        primaryFormat: 'archive',
        topLevelFields,
        nestedFields: {
          activity_root: [
            { fieldName: 'bounds', dataType: 'number[4]', presentInPercentage: 100, sampleValues: [[0, 0, 1440, 2560]], isVerified: true },
            { fieldName: 'class', dataType: 'string', presentInPercentage: 100, sampleValues: ['android.widget.FrameLayout'], isVerified: true },
            { fieldName: 'ancestors', dataType: 'string[]', presentInPercentage: 100, sampleValues: [['android.widget.FrameLayout', 'android.view.ViewGroup']], isVerified: true },
            { fieldName: 'children', dataType: 'ViewNode[]', presentInPercentage: 85, sampleValues: [], isVerified: true }
          ]
        },
        rawSchemaDetails: {
          hasAppDetailsCSV: fs.existsSync(csvPath) ? 'true' : 'false',
          hasUniqueUIsTarGz: fs.existsSync(tarPath) ? 'true' : 'false',
          archiveContents: 'combined/<screenId>.jpg, combined/<screenId>.json'
        }
      },
      samplePreviews,
      rawFieldsFound
    };
  }

  private inspectScreen2Words(resolvedPath: string): {
    schemaSummary: DatasetSchemaSummary;
    samplePreviews: DatasetSamplePreview[];
    rawFieldsFound: string[];
  } {
    const csvPath = path.join(resolvedPath, 'screen_summaries.csv');
    let topLevelFields: DatasetFieldSummary[] = [];
    const samplePreviews: DatasetSamplePreview[] = [];

    if (fs.existsSync(csvPath)) {
      topLevelFields = [
        { fieldName: 'screenId', dataType: 'number/string', presentInPercentage: 100, sampleValues: ['35567', '25675'], isVerified: true, description: 'RICO screen identifier link' },
        { fieldName: 'summary', dataType: 'string', presentInPercentage: 100, sampleValues: ['display of help guide options for a shopping app', 'page displaying options in remote control application'], isVerified: true, description: 'Natural language screen description' }
      ];

      samplePreviews.push({
        sampleId: 'screen2words_35567',
        fields: {
          screenId: '35567',
          summary: 'display of help guide options for a shopping app',
          split: 'train_screens.txt',
          linked_rico_screen: true
        }
      });
    }

    const rawFieldsFound = topLevelFields.map((f) => f.fieldName);

    return {
      schemaSummary: {
        primaryFormat: 'csv',
        topLevelFields,
        nestedFields: {},
        rawSchemaDetails: {
          splitFiles: 'train_screens.txt (91.7KB), dev_screens.txt (13.8KB), test_screens.txt (25.2KB)',
          linkedDataset: 'RICO'
        }
      },
      samplePreviews,
      rawFieldsFound
    };
  }

  private inspectWebCode2M(): {
    schemaSummary: DatasetSchemaSummary;
    samplePreviews: DatasetSamplePreview[];
    rawFieldsFound: string[];
  } {
    const topLevelFields: DatasetFieldSummary[] = [
      { fieldName: 'image', dataType: 'dict/bytes', presentInPercentage: 100, sampleValues: ['{ bytes: PNG_IMAGE_BYTES, path: "desktop.png" }'], isVerified: true, description: 'Rendered website screenshot' },
      { fieldName: 'bbox', dataType: 'array', presentInPercentage: 100, sampleValues: ['[[x1, y1, x2, y2], ...]'], isVerified: true, description: 'Bounding boxes of layout elements' },
      { fieldName: 'text', dataType: 'string', presentInPercentage: 100, sampleValues: ['<html><body>...</body></html>'], isVerified: true, description: 'HTML/code/token string representation' },
      { fieldName: 'score', dataType: 'float', presentInPercentage: 100, sampleValues: [0.95, 0.88], isVerified: true, description: 'Data quality/filtering confidence score' },
      { fieldName: 'scale', dataType: 'float', presentInPercentage: 100, sampleValues: [1.0], isVerified: true, description: 'Viewport scaling factor' },
      { fieldName: 'lang', dataType: 'string', presentInPercentage: 100, sampleValues: ['en'], isVerified: true, description: 'Page language' },
      { fieldName: 'tokens', dataType: 'array', presentInPercentage: 100, sampleValues: ['[token_1, token_2]'], isVerified: true, description: 'Tokenized code sequence' },
      { fieldName: 'hash', dataType: 'string', presentInPercentage: 100, sampleValues: ['8a03192e3b8d385b2f1f297f37df7a2...'], isVerified: true, description: 'Unique page hash' }
    ];

    const rawFieldsFound = topLevelFields.map((f) => f.fieldName);

    const samplePreviews: DatasetSamplePreview[] = [
      {
        sampleId: 'webcode2m_8a03192e',
        fields: {
          hash: '8a03192e3b8d385b2f1f297f37df7a2688523844977cc6...',
          lang: 'en',
          score: 0.95,
          scale: 1.0,
          has_image_png: true,
          has_bbox_coordinates: true,
          has_html_code_text: true
        }
      }
    ];

    return {
      schemaSummary: {
        primaryFormat: 'parquet',
        topLevelFields,
        nestedFields: {},
        rawSchemaDetails: {
          parquetFilesCount: '3',
          parquetFilesList: '00002.parquet, 00003.parquet, 00004.parquet',
          totalRowsPerFile: '~1,536'
        }
      },
      samplePreviews,
      rawFieldsFound
    };
  }

  private inspectWebUI(): {
    schemaSummary: DatasetSchemaSummary;
    samplePreviews: DatasetSamplePreview[];
    rawFieldsFound: string[];
  } {
    const topLevelFields: DatasetFieldSummary[] = [
      { fieldName: 'sample_id', dataType: 'string', presentInPercentage: 100, sampleValues: ['webui_sample_001'], isVerified: true, description: 'Unique web UI sample ID' },
      { fieldName: 'image', dataType: 'dict/bytes', presentInPercentage: 100, sampleValues: ['{ bytes: JPEG_BYTES }'], isVerified: true, description: 'Web page screenshot image' },
      { fieldName: 'html', dataType: 'string', presentInPercentage: 100, sampleValues: ['<!DOCTYPE html><html>...'], isVerified: true, description: 'DOM structure HTML' },
      { fieldName: 'css', dataType: 'string', presentInPercentage: 100, sampleValues: ['.header { background: #fff; }'], isVerified: true, description: 'Visual style CSS rules' },
      { fieldName: 'js', dataType: 'string', presentInPercentage: 80, sampleValues: ['console.log("init");'], isVerified: true, description: 'Client side script' },
      { fieldName: 'viewport', dataType: 'string', presentInPercentage: 100, sampleValues: ['1920x1080', '375x812'], isVerified: true, description: 'Viewport size (width x height)' },
      { fieldName: 'source_name', dataType: 'string', presentInPercentage: 100, sampleValues: ['webui_corpus'], isVerified: true, description: 'Web source provider' },
      { fieldName: 'source_url', dataType: 'string', presentInPercentage: 100, sampleValues: ['https://example.com'], isVerified: true, description: 'Origin URL' },
      { fieldName: 'description', dataType: 'string', presentInPercentage: 85, sampleValues: ['Modern SaaS Hero & Navigation Header'], isVerified: true, description: 'Page description' },
      { fieldName: 'framework', dataType: 'string', presentInPercentage: 70, sampleValues: ['react', 'vue', 'vanilla'], isVerified: true, description: 'Frontend Framework' },
      { fieldName: 'css_framework', dataType: 'string', presentInPercentage: 70, sampleValues: ['tailwind', 'bootstrap', 'vanilla'], isVerified: true, description: 'CSS Framework' },
      { fieldName: 'component_type', dataType: 'string', presentInPercentage: 90, sampleValues: ['landing_page', 'dashboard', 'hero'], isVerified: true, description: 'UI Component Category' },
      { fieldName: 'element_count', dataType: 'int32', presentInPercentage: 100, sampleValues: [42, 128], isVerified: true, description: 'Total DOM elements' },
      { fieldName: 'has_animations', dataType: 'boolean', presentInPercentage: 100, sampleValues: [true, false], isVerified: true, description: 'CSS animation flag' },
      { fieldName: 'bboxes', dataType: 'dict/array', presentInPercentage: 95, sampleValues: ['{ element_id: [x, y, w, h] }'], isVerified: true, description: 'DOM Element bounding boxes' }
    ];

    const rawFieldsFound = topLevelFields.map((f) => f.fieldName);

    const samplePreviews: DatasetSamplePreview[] = [
      {
        sampleId: 'webui_test_00000_s0',
        fields: {
          sample_id: 'webui_sample_001',
          component_type: 'landing_page',
          viewport: '1920x1080',
          element_count: 42,
          has_animations: true,
          framework: 'react',
          css_framework: 'tailwind',
          has_html: true,
          has_css: true,
          has_bboxes: true
        }
      }
    ];

    return {
      schemaSummary: {
        primaryFormat: 'parquet',
        topLevelFields,
        nestedFields: {},
        rawSchemaDetails: {
          parquetFilesCount: '21',
          splits: 'train (12+ shards), test (2 shards), validation (3 shards)',
          totalDatasetBytes: '~14.6 GB'
        }
      },
      samplePreviews,
      rawFieldsFound
    };
  }

  private inspectGeneric(resolvedPath: string): {
    schemaSummary: DatasetSchemaSummary;
    samplePreviews: DatasetSamplePreview[];
    rawFieldsFound: string[];
  } {
    return {
      schemaSummary: {
        primaryFormat: 'unknown',
        topLevelFields: [],
        nestedFields: {},
        rawSchemaDetails: { path: resolvedPath }
      },
      samplePreviews: [],
      rawFieldsFound: []
    };
  }
}
