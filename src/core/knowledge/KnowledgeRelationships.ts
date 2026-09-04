import { KnowledgeRelationship, KnowledgeRelationshipType } from './KnowledgeTypes';

export class KnowledgeRelationshipsHelper {
  public static createRelationship(
    sourceId: string,
    type: KnowledgeRelationshipType,
    targetId: string,
    weight: number = 1.0,
    description?: string
  ): KnowledgeRelationship {
    return {
      sourceId,
      type,
      targetId,
      weight: Math.max(0, Math.min(1, weight)),
      description
    };
  }

  public static isDirectMatch(
    rel: KnowledgeRelationship,
    sourceId: string,
    targetId: string
  ): boolean {
    return rel.sourceId === sourceId && rel.targetId === targetId;
  }
}
