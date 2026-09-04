import { ComponentLabelMapping } from './TaskPreparationTypes';

export class ComponentLabelMapper {
  /**
   * Maps source label from RICO (Android class), WebCode2M (HTML/bbox token), or WebUI into normalized component label.
   */
  public mapComponentLabel(sourceDataset: string, sourceLabel: string): ComponentLabelMapping {
    const raw = (sourceLabel || '').trim().toLowerCase();
    const dataset = sourceDataset.toUpperCase();

    // 1. Android Class Taxonomy (RICO)
    if (dataset === 'RICO' || raw.includes('android.widget') || raw.includes('android.view')) {
      if (raw.endsWith('button') || raw.endsWith('imagebutton') || raw.endsWith('togglebutton')) {
        return { sourceDataset, sourceLabel, normalizedLabel: 'button', mappingMethod: 'exact_taxonomy', mappingConfidence: 0.95 };
      }
      if (raw.endsWith('textview') || raw.endsWith('edittext')) {
        return { sourceDataset, sourceLabel, normalizedLabel: raw.endsWith('edittext') ? 'input' : 'text', mappingMethod: 'exact_taxonomy', mappingConfidence: 0.95 };
      }
      if (raw.endsWith('imageview')) {
        return { sourceDataset, sourceLabel, normalizedLabel: 'image', mappingMethod: 'exact_taxonomy', mappingConfidence: 0.95 };
      }
      if (raw.endsWith('listview') || raw.endsWith('recyclerview') || raw.endsWith('gridview')) {
        return { sourceDataset, sourceLabel, normalizedLabel: 'card', mappingMethod: 'heuristic', mappingConfidence: 0.85 };
      }
      if (raw.endsWith('actionbar') || raw.endsWith('toolbar')) {
        return { sourceDataset, sourceLabel, normalizedLabel: 'navbar', mappingMethod: 'exact_taxonomy', mappingConfidence: 0.9 };
      }
    }

    // 2. HTML Element Tag Taxonomy (WebCode2M & WebUI)
    if (raw.startsWith('<button') || raw === 'button' || raw === 'btn' || raw.includes('button')) {
      return { sourceDataset, sourceLabel, normalizedLabel: 'button', mappingMethod: 'html_element', mappingConfidence: 1.0 };
    }
    if (raw.startsWith('<input') || raw.startsWith('<textarea') || raw.startsWith('<select') || raw === 'input' || raw === 'form') {
      return { sourceDataset, sourceLabel, normalizedLabel: 'input', mappingMethod: 'html_element', mappingConfidence: 1.0 };
    }
    if (raw.startsWith('<img') || raw.startsWith('<svg') || raw === 'image' || raw === 'img' || raw === 'icon') {
      return { sourceDataset, sourceLabel, normalizedLabel: 'image', mappingMethod: 'html_element', mappingConfidence: 0.95 };
    }
    if (raw.startsWith('<header') || raw.startsWith('<nav') || raw === 'navbar' || raw === 'header') {
      return { sourceDataset, sourceLabel, normalizedLabel: raw.startsWith('<nav') || raw === 'navbar' ? 'navbar' : 'header', mappingMethod: 'html_element', mappingConfidence: 0.95 };
    }
    if (raw.startsWith('<footer') || raw === 'footer') {
      return { sourceDataset, sourceLabel, normalizedLabel: 'footer', mappingMethod: 'html_element', mappingConfidence: 0.95 };
    }
    if (raw.startsWith('<table') || raw === 'table' || raw === 'grid') {
      return { sourceDataset, sourceLabel, normalizedLabel: 'table', mappingMethod: 'html_element', mappingConfidence: 0.9 };
    }
    if (raw.startsWith('<aside') || raw.includes('sidebar')) {
      return { sourceDataset, sourceLabel, normalizedLabel: 'sidebar', mappingMethod: 'html_element', mappingConfidence: 0.9 };
    }
    if (raw.includes('card') || raw.includes('hero') || raw.includes('section') || raw.includes('bento')) {
      return { sourceDataset, sourceLabel, normalizedLabel: 'card', mappingMethod: 'heuristic', mappingConfidence: 0.85 };
    }
    if (raw.startsWith('<p') || raw.startsWith('<h') || raw.startsWith('<span') || raw === 'text') {
      return { sourceDataset, sourceLabel, normalizedLabel: 'text', mappingMethod: 'html_element', mappingConfidence: 0.9 };
    }

    return { sourceDataset, sourceLabel, normalizedLabel: 'other', mappingMethod: 'heuristic', mappingConfidence: 0.6 };
  }
}
