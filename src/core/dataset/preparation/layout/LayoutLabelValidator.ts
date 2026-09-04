import { LayoutDerivedLabel } from './LayoutPreparationTypes';

export class LayoutLabelValidator {
  public validateLabel(derivedLabel: LayoutDerivedLabel | null): { isValid: boolean; reason?: string } {
    if (!derivedLabel) {
      return { isValid: false, reason: 'Layout support unavailable for text-only record' };
    }

    const validLabels = [
      'single_column',
      'two_column',
      'three_column',
      'grid',
      'sidebar',
      'stack',
      'centered',
      'other'
    ];

    if (!validLabels.includes(derivedLabel.label)) {
      return { isValid: false, reason: `Unknown layout label: ${derivedLabel.label}` };
    }

    if (!derivedLabel.derivationEvidence || derivedLabel.derivationEvidence.length === 0) {
      return { isValid: false, reason: 'Missing derivation evidence' };
    }

    if (!derivedLabel.sourceDataset || !derivedLabel.sourceRecordId) {
      return { isValid: false, reason: 'Missing source dataset or record ID' };
    }

    return { isValid: true };
  }
}
