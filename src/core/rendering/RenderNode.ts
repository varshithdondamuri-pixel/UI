import { BoundingBox } from '../../types';
import {
  AnimationReference,
  IconReference,
  IllustrationReference,
  StyleReference,
  TextReference,
  Transform2D
} from './RenderingTypes';

export interface RenderNode {
  id: string;
  componentType: string;
  bounds: BoundingBox;
  transform: Transform2D;
  styleReference: StyleReference;
  layoutReference: string;
  textReference: TextReference;
  iconReference: IconReference;
  illustrationReference: IllustrationReference;
  animationReference: AnimationReference;
  children: RenderNode[];
  visibility: boolean;
  opacity: number;
  clipping: boolean;
  zIndex: number;
}
