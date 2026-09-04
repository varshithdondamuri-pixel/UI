import { KnowledgeRecord, KnowledgeRelationshipType } from './KnowledgeTypes';

export interface GraphNode {
  id: string;
  title: string;
  category: string;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  type: KnowledgeRelationshipType;
  weight: number;
  description?: string;
}

export class KnowledgeGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];
  private adjacencyList: Map<string, GraphEdge[]> = new Map();

  public buildGraph(records: KnowledgeRecord[]): void {
    this.nodes.clear();
    this.edges = [];
    this.adjacencyList.clear();

    for (const record of records) {
      this.nodes.set(record.id, {
        id: record.id,
        title: record.title,
        category: record.category
      });
      this.adjacencyList.set(record.id, []);
    }

    for (const record of records) {
      if (record.relationships) {
        for (const rel of record.relationships) {
          const edge: GraphEdge = {
            sourceId: rel.sourceId || record.id,
            targetId: rel.targetId,
            type: rel.type,
            weight: rel.weight,
            description: rel.description
          };
          this.edges.push(edge);
          if (this.adjacencyList.has(edge.sourceId)) {
            this.adjacencyList.get(edge.sourceId)!.push(edge);
          }
        }
      }
    }
  }

  public getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getEdges(): GraphEdge[] {
    return [...this.edges];
  }

  public getOutgoingEdges(nodeId: string): GraphEdge[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  public getRelatedTargetIds(nodeId: string, relType?: KnowledgeRelationshipType): string[] {
    const edges = this.getOutgoingEdges(nodeId);
    return edges
      .filter((e) => !relType || e.type === relType)
      .map((e) => e.targetId);
  }

  public getNeighbors(nodeId: string): { node: GraphNode; edge: GraphEdge }[] {
    const edges = this.getOutgoingEdges(nodeId);
    const result: { node: GraphNode; edge: GraphEdge }[] = [];

    for (const edge of edges) {
      const node = this.nodes.get(edge.targetId);
      if (node) {
        result.push({ node, edge });
      }
    }

    return result;
  }
}
