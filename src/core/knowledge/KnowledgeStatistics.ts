import { KNOWLEDGE_CATEGORIES } from './KnowledgeCategories';
import {
  KnowledgeCategoryType,
  KnowledgeQualityDistribution,
  KnowledgeRecord,
  KnowledgeStats
} from './KnowledgeTypes';

export class KnowledgeStatistics {
  public computeStats(records: KnowledgeRecord[]): KnowledgeStats {
    const totalEntries = records.length;

    // Initialize category counts
    const entriesPerCategory = {} as Record<KnowledgeCategoryType, number>;
    for (const key of Object.keys(KNOWLEDGE_CATEGORIES) as KnowledgeCategoryType[]) {
      entriesPerCategory[key] = 0;
    }

    const entriesPerIndustry: Record<string, number> = {};
    const entriesPerStyle: Record<string, number> = {};

    const qualityDist: KnowledgeQualityDistribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0
    };

    let populatedCategoriesCount = 0;

    for (const record of records) {
      // Category breakdown
      if (entriesPerCategory[record.category] !== undefined) {
        entriesPerCategory[record.category]++;
      } else {
        entriesPerCategory[record.category] = 1;
      }

      // Industry breakdown
      const ind = record.industry || 'General';
      entriesPerIndustry[ind] = (entriesPerIndustry[ind] || 0) + 1;

      // Style breakdown
      const st = record.style || 'Modern';
      entriesPerStyle[st] = (entriesPerStyle[st] || 0) + 1;

      // Quality distribution
      if (record.qualityScore >= 90) {
        qualityDist.excellent++;
      } else if (record.qualityScore >= 75) {
        qualityDist.good++;
      } else if (record.qualityScore >= 50) {
        qualityDist.fair++;
      } else {
        qualityDist.poor++;
      }
    }

    // Compute coverage
    const totalCategories = Object.keys(KNOWLEDGE_CATEGORIES).length;
    for (const key of Object.keys(KNOWLEDGE_CATEGORIES) as KnowledgeCategoryType[]) {
      if (entriesPerCategory[key] > 0) {
        populatedCategoriesCount++;
      }
    }
    const coveragePercentage = Number(
      ((populatedCategoriesCount / totalCategories) * 100).toFixed(1)
    );

    return {
      totalEntries,
      entriesPerCategory,
      entriesPerIndustry,
      entriesPerStyle,
      coveragePercentage,
      qualityDistribution: qualityDist
    };
  }
}
