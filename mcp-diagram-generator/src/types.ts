export type DiagramFormat = 'drawio' | 'mermaid' | 'excalidraw';
export type ContainerLevel = 'environment' | 'datacenter' | 'zone' | 'other';
export type DeviceType = 'router' | 'switch' | 'firewall' | 'server' | 'pc' | 'database' | 'cloud' | 'other';
export type ShapeType = 'rect' | 'ellipse' | 'diamond' | 'parallelogram' | 'rounded' | 'cylinder' | 'cloud' | 'other';
export type FontStyle = 'normal' | 'bold' | 'italic';
export type ArrowType = 'none' | 'arrow' | 'circle' | 'diamond';
export type LineStyle = 'straight' | 'orthogonal' | 'curved';

export interface Geometry {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface Style {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontColor?: string;
  fontSize?: number;
  fontStyle?: FontStyle;
  borderRadius?: number;
  dashPattern?: string;
  __className?: string; // Internal use for style class assignment
}

export interface EdgeStyle extends Style {
  endArrow?: ArrowType;
  startArrow?: ArrowType;
  lineStyle?: LineStyle;
}

export interface BaseElement {
  id: string;
  name?: string;
}

export interface Container extends BaseElement {
  type: 'container';
  name: string;
  level?: ContainerLevel;
  style?: Style;
  geometry: Geometry & { width: number; height: number };
  children?: (Container | Node)[];
}

export interface Node extends BaseElement {
  type: 'node';
  name: string;
  deviceType?: DeviceType;
  shape?: ShapeType;
  style?: Style;
  geometry: Geometry & { width: number; height: number };
}

export interface Edge {
  id?: string;
  type: 'edge';
  source: string;
  target: string;
  label?: string;
  style?: EdgeStyle;
}

export type Element = Container | Node | Edge;

export interface DiagramSpec {
  format: DiagramFormat;
  title?: string;
  elements: Element[];
}

export interface GenerateDiagramParams {
  diagram_spec: DiagramSpec;
  output_path: string;
  format?: DiagramFormat;
}
