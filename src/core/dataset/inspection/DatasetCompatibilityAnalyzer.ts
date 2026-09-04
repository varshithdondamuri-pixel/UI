import { MLTaskIdentifier } from '../../ml/MLTaskTypes';
import {
  FeatureGroupCompatibilityDetail,
  FeatureGroupIdentifier,
  TaskCompatibilityDetail
} from './DatasetInspectionTypes';

export class DatasetCompatibilityAnalyzer {
  public analyzeTaskCompatibility(
    datasetId: string,
    _verifiedFields: string[] = []
  ): Record<MLTaskIdentifier, TaskCompatibilityDetail> {


    switch (datasetId.toLowerCase()) {
      case 'rico':
        return {
          ui_understanding: {
            task: 'ui_understanding',
            status: 'SUPPORTED',
            rationale: 'RICO contains complete Android view nodes, bounds, text, class names, and image screenshots.',
            requiredFieldsPresent: ['bounds', 'class', 'ancestors', 'text', 'activity_name'],
            missingFields: []
          },
          semantic_prediction: {
            task: 'semantic_prediction',
            status: 'SUPPORTED',
            rationale: 'RICO contains Android view hierarchy, view types, and ancestor class chains.',
            requiredFieldsPresent: ['class', 'ancestors', 'activity_name'],
            missingFields: []
          },
          intent_prediction: {
            task: 'intent_prediction',
            status: 'UNSUPPORTED',
            rationale: 'Raw RICO lacks natural language user prompts and explicit layout intent statements.',
            requiredFieldsPresent: [],
            missingFields: ['user_prompt', 'intent_tree', 'goal_summary']
          },
          layout_prediction: {
            task: 'layout_prediction',
            status: 'PARTIAL',
            rationale: 'RICO contains mobile bounding boxes and positions, but lacks web grid/flex metadata and web blueprints.',
            requiredFieldsPresent: ['bounds', 'children'],
            missingFields: ['grid_columns', 'web_blueprint', 'flex_direction']
          },
          component_recommendation: {
            task: 'component_recommendation',
            status: 'SUPPORTED',
            rationale: 'RICO view class names and resource IDs support mobile UI component type classification.',
            requiredFieldsPresent: ['class', 'resource-id'],
            missingFields: []
          },
          visual_style_recommendation: {
            task: 'visual_style_recommendation',
            status: 'PARTIAL',
            rationale: 'RICO contains screen images and view classes, but lacks explicit CSS design tokens and color palettes.',
            requiredFieldsPresent: ['activity_name'],
            missingFields: ['css_rules', 'color_palette', 'typography_scale']
          },
          responsive_prediction: {
            task: 'responsive_prediction',
            status: 'UNSUPPORTED',
            rationale: 'RICO contains single mobile viewport screens without multi-breakpoint pairs.',
            requiredFieldsPresent: [],
            missingFields: ['desktop_viewport', 'tablet_viewport', 'breakpoint_pair']
          },
          design_quality_prediction: {
            task: 'design_quality_prediction',
            status: 'UNSUPPORTED',
            rationale: 'Raw RICO does not include quality ratings, accessibility scores, or human design evaluations.',
            requiredFieldsPresent: [],
            missingFields: ['quality_score', 'a11y_score', 'human_rating']
          },
          alternative_ranking: {
            task: 'alternative_ranking',
            status: 'UNSUPPORTED',
            rationale: 'RICO contains individual screens without alternative layout choices.',
            requiredFieldsPresent: [],
            missingFields: ['design_variants', 'ranking_pair']
          },
          user_preference_prediction: {
            task: 'user_preference_prediction',
            status: 'UNSUPPORTED',
            rationale: 'RICO does not record user selection history or design change preferences.',
            requiredFieldsPresent: [],
            missingFields: ['user_selection', 'preference_log']
          }
        };

      case 'screen2words':
        return {
          ui_understanding: {
            task: 'ui_understanding',
            status: 'SUPPORTED',
            rationale: 'Screen2Words provides natural language screen descriptions of UI structure.',
            requiredFieldsPresent: ['summary', 'screenId'],
            missingFields: []
          },
          semantic_prediction: {
            task: 'semantic_prediction',
            status: 'SUPPORTED',
            rationale: 'Screen summaries describe functional screen intent and component roles.',
            requiredFieldsPresent: ['summary'],
            missingFields: []
          },
          intent_prediction: {
            task: 'intent_prediction',
            status: 'SUPPORTED',
            rationale: 'Human screen goal summaries serve as ground-truth layout intent annotations.',
            requiredFieldsPresent: ['summary'],
            missingFields: []
          },
          layout_prediction: {
            task: 'layout_prediction',
            status: 'PARTIAL',
            rationale: 'Descriptive summaries outline layout structure, relying on RICO for explicit coordinates.',
            requiredFieldsPresent: ['summary'],
            missingFields: ['explicit_bounding_boxes']
          },
          component_recommendation: {
            task: 'component_recommendation',
            status: 'PARTIAL',
            rationale: 'Summaries explicitly mention UI component types (e.g. lists, buttons, forms).',
            requiredFieldsPresent: ['summary'],
            missingFields: ['component_code']
          },
          visual_style_recommendation: {
            task: 'visual_style_recommendation',
            status: 'UNSUPPORTED',
            rationale: 'Screen2Words summaries do not record visual style or CSS design tokens.',
            requiredFieldsPresent: [],
            missingFields: ['css', 'color_theme']
          },
          responsive_prediction: {
            task: 'responsive_prediction',
            status: 'UNSUPPORTED',
            rationale: 'Screen2Words contains screen descriptions without multi-breakpoint metadata.',
            requiredFieldsPresent: [],
            missingFields: ['responsive_breakpoints']
          },
          design_quality_prediction: {
            task: 'design_quality_prediction',
            status: 'UNSUPPORTED',
            rationale: 'Screen2Words has no design quality metrics.',
            requiredFieldsPresent: [],
            missingFields: ['quality_rating']
          },
          alternative_ranking: {
            task: 'alternative_ranking',
            status: 'UNSUPPORTED',
            rationale: 'No design variant rankings exist in Screen2Words.',
            requiredFieldsPresent: [],
            missingFields: ['candidate_variants']
          },
          user_preference_prediction: {
            task: 'user_preference_prediction',
            status: 'UNSUPPORTED',
            rationale: 'No user interaction or preference selections exist in Screen2Words.',
            requiredFieldsPresent: [],
            missingFields: ['user_preference_logs']
          }
        };

      case 'webcode2m':
        return {
          ui_understanding: {
            task: 'ui_understanding',
            status: 'SUPPORTED',
            rationale: 'WebCode2M provides rendered PNG screenshots, bounding boxes, and HTML text tokens.',
            requiredFieldsPresent: ['image', 'bbox', 'text'],
            missingFields: []
          },
          semantic_prediction: {
            task: 'semantic_prediction',
            status: 'SUPPORTED',
            rationale: 'HTML tags and bounding box tokens enable semantic node extraction.',
            requiredFieldsPresent: ['text', 'bbox'],
            missingFields: []
          },
          intent_prediction: {
            task: 'intent_prediction',
            status: 'UNSUPPORTED',
            rationale: 'WebCode2M lacks natural language user prompt intent annotations.',
            requiredFieldsPresent: [],
            missingFields: ['user_prompt', 'intent_summary']
          },
          layout_prediction: {
            task: 'layout_prediction',
            status: 'SUPPORTED',
            rationale: 'WebCode2M contains bounding boxes and web layout HTML tokens.',
            requiredFieldsPresent: ['bbox', 'text'],
            missingFields: []
          },
          component_recommendation: {
            task: 'component_recommendation',
            status: 'SUPPORTED',
            rationale: 'HTML element code tokens and bounding boxes allow component recommendation.',
            requiredFieldsPresent: ['text', 'bbox'],
            missingFields: []
          },
          visual_style_recommendation: {
            task: 'visual_style_recommendation',
            status: 'PARTIAL',
            rationale: 'WebCode2M includes website screenshots and code tokens, but lacks parsed CSS rules.',
            requiredFieldsPresent: ['image', 'text'],
            missingFields: ['parsed_css']
          },
          responsive_prediction: {
            task: 'responsive_prediction',
            status: 'PARTIAL',
            rationale: 'WebCode2M provides scale factors and bboxes, but single viewports per record.',
            requiredFieldsPresent: ['scale', 'bbox'],
            missingFields: ['multi_device_pairs']
          },
          design_quality_prediction: {
            task: 'design_quality_prediction',
            status: 'PARTIAL',
            rationale: 'Includes data quality score column, but no human UX or accessibility rating.',
            requiredFieldsPresent: ['score'],
            missingFields: ['ux_rating', 'a11y_score']
          },
          alternative_ranking: {
            task: 'alternative_ranking',
            status: 'UNSUPPORTED',
            rationale: 'No candidate variant choices exist in WebCode2M.',
            requiredFieldsPresent: [],
            missingFields: ['variant_options']
          },
          user_preference_prediction: {
            task: 'user_preference_prediction',
            status: 'UNSUPPORTED',
            rationale: 'No user interaction logs present.',
            requiredFieldsPresent: [],
            missingFields: ['user_logs']
          }
        };

      case 'webui':
        return {
          ui_understanding: {
            task: 'ui_understanding',
            status: 'SUPPORTED',
            rationale: 'WebUI provides image, HTML, DOM bboxes, and element counts.',
            requiredFieldsPresent: ['image', 'html', 'bboxes', 'element_count'],
            missingFields: []
          },
          semantic_prediction: {
            task: 'semantic_prediction',
            status: 'SUPPORTED',
            rationale: 'Full HTML tree and component type labels enable semantic hierarchy parsing.',
            requiredFieldsPresent: ['html', 'component_type'],
            missingFields: []
          },
          intent_prediction: {
            task: 'intent_prediction',
            status: 'PARTIAL',
            rationale: 'Description field provides web UI purpose, but lacks user prompt history.',
            requiredFieldsPresent: ['description'],
            missingFields: ['user_prompt_history']
          },
          layout_prediction: {
            task: 'layout_prediction',
            status: 'SUPPORTED',
            rationale: 'WebUI provides full HTML, CSS, viewport, and bounding boxes for web layout synthesis.',
            requiredFieldsPresent: ['html', 'css', 'viewport', 'bboxes'],
            missingFields: []
          },
          component_recommendation: {
            task: 'component_recommendation',
            status: 'SUPPORTED',
            rationale: 'Explicit component_type, framework, css_framework, and HTML code.',
            requiredFieldsPresent: ['component_type', 'framework', 'css_framework', 'html'],
            missingFields: []
          },
          visual_style_recommendation: {
            task: 'visual_style_recommendation',
            status: 'SUPPORTED',
            rationale: 'WebUI contains full CSS stylesheet strings, css_framework labels, and image screenshots.',
            requiredFieldsPresent: ['css', 'css_framework', 'image'],
            missingFields: []
          },
          responsive_prediction: {
            task: 'responsive_prediction',
            status: 'SUPPORTED',
            rationale: 'WebUI specifies viewport metadata, HTML, CSS media queries, and element counts.',
            requiredFieldsPresent: ['viewport', 'html', 'css'],
            missingFields: []
          },
          design_quality_prediction: {
            task: 'design_quality_prediction',
            status: 'PARTIAL',
            rationale: 'has_animations, element_count, and framework provide structural quality signals.',
            requiredFieldsPresent: ['has_animations', 'element_count', 'framework'],
            missingFields: ['human_evaluation_score']
          },
          alternative_ranking: {
            task: 'alternative_ranking',
            status: 'UNSUPPORTED',
            rationale: 'WebUI contains single web page records without design variant rankings.',
            requiredFieldsPresent: [],
            missingFields: ['candidate_ranking_pairs']
          },
          user_preference_prediction: {
            task: 'user_preference_prediction',
            status: 'UNSUPPORTED',
            rationale: 'WebUI does not record user choice history or preference interactions.',
            requiredFieldsPresent: [],
            missingFields: ['user_click_logs']
          }
        };

      default:
        return this.getUnknownTaskMatrix();
    }
  }

  public analyzeFeatureGroupCompatibility(
    datasetId: string,
    _verifiedFields: string[] = []
  ): {
    availableFeatureGroups: FeatureGroupIdentifier[];
    partiallyAvailableFeatureGroups: FeatureGroupIdentifier[];
    missingFeatureGroups: FeatureGroupIdentifier[];
    unsupportedFeatureGroups: FeatureGroupIdentifier[];
    details: Record<FeatureGroupIdentifier, FeatureGroupCompatibilityDetail>;
  } {
    const allGroups: FeatureGroupIdentifier[] = [
      'sketch_features',
      'geometry_features',
      'semantic_features',
      'intent_features',
      'layout_features',
      'component_features',
      'visual_features',
      'typography_features',
      'color_features',
      'spacing_features',
      'responsive_features',
      'accessibility_features',
      'interaction_features',
      'preference_features',
      'quality_features',
      'prompt_features',
      'industry_features',
      'style_features'
    ];

    const available: FeatureGroupIdentifier[] = [];
    const partial: FeatureGroupIdentifier[] = [];
    const missing: FeatureGroupIdentifier[] = [];
    const unsupported: FeatureGroupIdentifier[] = [];
    const details: Partial<Record<FeatureGroupIdentifier, FeatureGroupCompatibilityDetail>> = {};

    for (const group of allGroups) {
      const detail = this.getFeatureGroupDetail(datasetId, group);
      details[group] = detail;

      if (detail.status === 'available') available.push(group);
      else if (detail.status === 'partiallyAvailable') partial.push(group);
      else if (detail.status === 'missing') missing.push(group);
      else unsupported.push(group);
    }

    return {
      availableFeatureGroups: available,
      partiallyAvailableFeatureGroups: partial,
      missingFeatureGroups: missing,
      unsupportedFeatureGroups: unsupported,
      details: details as Record<FeatureGroupIdentifier, FeatureGroupCompatibilityDetail>
    };
  }

  private getFeatureGroupDetail(
    datasetId: string,
    group: FeatureGroupIdentifier
  ): FeatureGroupCompatibilityDetail {
    const id = datasetId.toLowerCase();

    if (id === 'rico') {
      if (group === 'sketch_features' || group === 'geometry_features') {
        return { featureGroup: group, status: 'available', supportedFields: ['bounds', 'children'], missingFields: [] };
      }
      if (group === 'semantic_features' || group === 'component_features') {
        return { featureGroup: group, status: 'available', supportedFields: ['class', 'ancestors', 'resource-id'], missingFields: [] };
      }
      if (group === 'layout_features' || group === 'visual_features') {
        return { featureGroup: group, status: 'partiallyAvailable', supportedFields: ['activity_name', 'bounds'], missingFields: ['css_grid'] };
      }
      if (group === 'industry_features') {
        return { featureGroup: group, status: 'available', supportedFields: ['Category', 'Play Store Name'], missingFields: [] };
      }
    }

    if (id === 'screen2words') {
      if (group === 'prompt_features' || group === 'intent_features') {
        return { featureGroup: group, status: 'available', supportedFields: ['summary'], missingFields: [] };
      }
      if (group === 'semantic_features' || group === 'component_features') {
        return { featureGroup: group, status: 'partiallyAvailable', supportedFields: ['summary'], missingFields: ['explicit_nodes'] };
      }
    }

    if (id === 'webcode2m') {
      if (group === 'sketch_features' || group === 'geometry_features' || group === 'layout_features') {
        return { featureGroup: group, status: 'available', supportedFields: ['bbox', 'image'], missingFields: [] };
      }
      if (group === 'component_features' || group === 'semantic_features') {
        return { featureGroup: group, status: 'available', supportedFields: ['text', 'tokens'], missingFields: [] };
      }
      if (group === 'quality_features') {
        return { featureGroup: group, status: 'partiallyAvailable', supportedFields: ['score'], missingFields: ['a11y_score'] };
      }
    }

    if (id === 'webui') {
      if (group === 'geometry_features' || group === 'layout_features' || group === 'component_features') {
        return { featureGroup: group, status: 'available', supportedFields: ['bboxes', 'html', 'element_count'], missingFields: [] };
      }
      if (group === 'visual_features' || group === 'typography_features' || group === 'color_features' || group === 'spacing_features') {
        return { featureGroup: group, status: 'available', supportedFields: ['css', 'css_framework', 'image'], missingFields: [] };
      }
      if (group === 'responsive_features') {
        return { featureGroup: group, status: 'available', supportedFields: ['viewport', 'css'], missingFields: [] };
      }
      if (group === 'industry_features' || group === 'style_features') {
        return { featureGroup: group, status: 'available', supportedFields: ['component_type', 'framework'], missingFields: [] };
      }
      if (group === 'prompt_features') {
        return { featureGroup: group, status: 'partiallyAvailable', supportedFields: ['description'], missingFields: ['user_prompt_history'] };
      }
      if (group === 'quality_features') {
        return { featureGroup: group, status: 'partiallyAvailable', supportedFields: ['has_animations', 'element_count'], missingFields: ['human_score'] };
      }
    }

    return {
      featureGroup: group,
      status: 'unsupported',
      supportedFields: [],
      missingFields: ['field_not_in_dataset']
    };
  }

  private getUnknownTaskMatrix(): Record<MLTaskIdentifier, TaskCompatibilityDetail> {
    const tasks: MLTaskIdentifier[] = [
      'ui_understanding',
      'semantic_prediction',
      'intent_prediction',
      'layout_prediction',
      'component_recommendation',
      'visual_style_recommendation',
      'responsive_prediction',
      'design_quality_prediction',
      'alternative_ranking',
      'user_preference_prediction'
    ];

    const result: Partial<Record<MLTaskIdentifier, TaskCompatibilityDetail>> = {};
    for (const t of tasks) {
      result[t] = {
        task: t,
        status: 'UNKNOWN',
        rationale: 'Dataset contents have not been verified.',
        requiredFieldsPresent: [],
        missingFields: []
      };
    }
    return result as Record<MLTaskIdentifier, TaskCompatibilityDetail>;
  }
}
