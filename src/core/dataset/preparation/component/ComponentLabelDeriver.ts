export class ComponentLabelDeriver {
  public deriveLabel(rawRecord: any): { canonicalName: string; confidence: number; isSupported: boolean; reason?: string } {
    if (!rawRecord) {
      return { canonicalName: 'other', confidence: 0.0, isSupported: false, reason: 'Record is empty or undefined' };
    }

    // Check if record is text-only summary (e.g. Screen2Words without DOM/visual structure)
    if (rawRecord.datasetName === 'Screen2Words' || (rawRecord.provenance && rawRecord.provenance.sourceName === 'Screen2Words')) {
      return {
        canonicalName: 'other',
        confidence: 0.0,
        isSupported: false,
        reason: 'Text-only summary dataset lacking structural component evidence'
      };
    }

    const payload = rawRecord.payload || rawRecord.fields || rawRecord;
    const tag = (payload.tag || payload.tagType || payload.class || payload.nodeType || '').toLowerCase();
    const role = (payload.role || payload.ariaRole || '').toLowerCase();
    const text = (payload.text || payload.label || payload.content || '').toLowerCase();
    const width = payload.width || payload.bounds?.width || 0;
    const height = payload.height || payload.bounds?.height || 0;

    // Rule 1: Button
    if (
      tag.includes('button') ||
      role.includes('button') ||
      tag === 'a.btn' ||
      text === 'click' || text === 'submit' || text === 'sign in' || text === 'log in' || text === 'ok' || text === 'cancel' || text === 'save'
    ) {
      return { canonicalName: 'button', confidence: 0.95, isSupported: true };
    }

    // Rule 2: Heading
    if (
      /^h[1-6]$/.test(tag) ||
      role.includes('heading') ||
      tag.includes('title') ||
      (text.length > 0 && text.length < 50 && (height > 40 || tag.includes('header')))
    ) {
      return { canonicalName: 'heading', confidence: 0.92, isSupported: true };
    }

    // Rule 3: Input / Textbox
    if (
      tag.includes('input') ||
      tag.includes('textbox') ||
      role.includes('textbox') ||
      role.includes('searchbox') ||
      tag.includes('edittext')
    ) {
      return { canonicalName: 'input', confidence: 0.94, isSupported: true };
    }

    // Rule 4: Checkbox
    if (tag.includes('checkbox') || role === 'checkbox') {
      return { canonicalName: 'checkbox', confidence: 0.96, isSupported: true };
    }

    // Rule 5: Radio
    if (tag.includes('radio') || role === 'radio') {
      return { canonicalName: 'radio', confidence: 0.96, isSupported: true };
    }

    // Rule 6: Switch
    if (tag.includes('switch') || role === 'switch' || tag.includes('toggle')) {
      return { canonicalName: 'switch', confidence: 0.92, isSupported: true };
    }

    // Rule 7: Image
    if (tag.includes('img') || tag.includes('image') || role.includes('image') || role.includes('graphic')) {
      return { canonicalName: 'image', confidence: 0.95, isSupported: true };
    }

    // Rule 8: Icon
    if (tag.includes('svg') || tag.includes('icon') || role.includes('icon') || (width > 0 && width <= 48 && height > 0 && height <= 48 && (width === height))) {
      return { canonicalName: 'icon', confidence: 0.88, isSupported: true };
    }

    // Rule 9: Card
    if (tag.includes('card') || role.includes('card') || tag.includes('tile') || tag.includes('panel')) {
      return { canonicalName: 'card', confidence: 0.87, isSupported: true };
    }

    // Rule 10: Navigation
    if (tag.includes('nav') || role.includes('navigation') || tag.includes('navbar')) {
      return { canonicalName: 'navigation', confidence: 0.89, isSupported: true };
    }

    // Rule 11: List
    if (tag === 'ul' || tag === 'ol' || tag.includes('list') || role.includes('list') || tag.includes('recyclerview')) {
      return { canonicalName: 'list', confidence: 0.90, isSupported: true };
    }

    // Rule 12: Grid
    if (tag.includes('grid') || role.includes('grid')) {
      return { canonicalName: 'grid', confidence: 0.88, isSupported: true };
    }

    // Rule 13: Dropdown
    if (tag.includes('select') || tag.includes('dropdown') || role.includes('combobox')) {
      return { canonicalName: 'dropdown', confidence: 0.91, isSupported: true };
    }

    // Rule 14: Text Body
    if (text.length > 0) {
      return { canonicalName: 'text', confidence: 0.90, isSupported: true };
    }

    // Fallback
    return { canonicalName: 'other', confidence: 0.70, isSupported: true };
  }
}
