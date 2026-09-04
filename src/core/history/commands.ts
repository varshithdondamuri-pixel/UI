import { ICommand, CanvasNode } from '../../types';
import { SceneGraph } from '../scene/SceneGraph';

export class CreateNodeCommand implements ICommand {
  type = 'CREATE_NODE';
  constructor(private sceneGraph: SceneGraph, private node: CanvasNode) {}

  execute(): void {
    this.sceneGraph.addNode(this.node);
  }

  undo(): void {
    this.sceneGraph.removeNode(this.node.uuid);
  }
}

export class DeleteNodeCommand implements ICommand {
  type = 'DELETE_NODE';
  constructor(private sceneGraph: SceneGraph, private node: CanvasNode) {}

  execute(): void {
    this.sceneGraph.removeNode(this.node.uuid);
  }

  undo(): void {
    this.sceneGraph.addNode(this.node);
  }
}

export class UpdateNodeCommand implements ICommand {
  type = 'UPDATE_NODE';
  constructor(
    private sceneGraph: SceneGraph,
    private uuid: string,
    private prevProps: Partial<CanvasNode>,
    private newProps: Partial<CanvasNode>
  ) {}

  execute(): void {
    this.sceneGraph.updateNode(this.uuid, this.newProps);
  }

  undo(): void {
    this.sceneGraph.updateNode(this.uuid, this.prevProps);
  }
}

export class BatchCommand implements ICommand {
  type = 'BATCH_COMMAND';
  constructor(private commands: ICommand[]) {}

  execute(): void {
    for (const cmd of this.commands) {
      cmd.execute();
    }
  }

  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}
