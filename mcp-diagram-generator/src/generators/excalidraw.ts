import * as fs from 'fs/promises';
import * as path from 'path';
import { DiagramSpec, Node, Edge, Container, Geometry } from '../types.js';

interface ExcalidrawElement {
  type: string;
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: string;
  strokeWidth?: number;
  strokeStyle?: string;
  roughness?: number;
  opacity?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  points?: [[number, number], [number, number]];
  startArrowhead?: string | null;
  endArrowhead?: string | null;
  startBinding?: { elementId: string; focus?: number; gap?: number };
  endBinding?: { elementId: string; focus?: number; gap?: number };
  containerId?: { id: string };
  angle?: number;
  roundness?: { type: number };
}

interface ExcalidrawData {
  type: 'excalidraw';
  version: number;
  source: string;
  elements: ExcalidrawElement[];
  appState: {
    viewBackgroundColor: string;
  };
}

interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ExcalidrawGenerator {
  private idMap = new Map<string, string>();
  private positionMap = new Map<string, ElementPosition>();  // ✅ 添加位置映射
  private nextId = 1;

  async generate(spec: DiagramSpec, outputPath: string): Promise<void> {
    this.resetState();
    const data = this.generateData(spec);
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private resetState(): void {
    this.idMap.clear();
    this.positionMap.clear();  // ✅ 清除位置映射
    this.nextId = 1;
  }

  private generateData(spec: DiagramSpec): ExcalidrawData {
    const elements: ExcalidrawElement[] = [];
    let xOffset = 0;
    let yOffset = 0;

    for (const element of spec.elements) {
      if (element.type === 'container') {
        const containerElements = this.generateContainer(element, xOffset, yOffset);
        elements.push(...containerElements);
        yOffset += (element.geometry.height || 300) + 50;
      } else if (element.type === 'node') {
        const nodeElements = this.generateNode(element, xOffset, yOffset);
        if (Array.isArray(nodeElements)) {
          elements.push(...nodeElements);
          this.idMap.set(element.id, nodeElements[0].id);
        } else {
          elements.push(nodeElements);
          this.idMap.set(element.id, nodeElements.id);
        }
        xOffset += (element.geometry.width || 100) + 50;
      }
    }

    for (const element of spec.elements) {
      if (element.type === 'edge') {
        const edgeResult = this.generateEdge(element);
        if (Array.isArray(edgeResult)) {
          elements.push(...edgeResult);
        } else if (edgeResult) {
          elements.push(edgeResult);
        }
      }
    }

    return {
      type: 'excalidraw',
      version: 2,
      source: 'mcp-diagram-generator',
      elements,
      appState: {
        viewBackgroundColor: '#ffffff'
      }
    };
  }

  private generateContainer(container: Container, x: number, y: number): ExcalidrawElement[] {
    const elements: ExcalidrawElement[] = [];
    const id = this.nextId++;
    const labelId = this.nextId++;  // ✅ 使用独立的 ID，避免冲突

    const geometry = this.resolveContainerGeometry(container);
    const width = geometry.width || 300;
    const height = geometry.height || 200;
    const fillColor = geometry.fillColor;
    const strokeColor = geometry.strokeColor;
    const strokeWidth = geometry.strokeWidth || 2;

    const containerElement: ExcalidrawElement = {
      type: 'rectangle',
      id: id.toString(),
      x,
      y,
      width,
      height,
      strokeColor: strokeColor,
      backgroundColor: fillColor,
      strokeWidth: strokeWidth || 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100
    };

    const labelElement: ExcalidrawElement = {
      type: 'text',
      id: labelId.toString(),  // ✅ 使用独立的 labelId
      x: x + 10,
      y: y + 10,
      width: width - 20,
      height: 30,
      text: container.name,
      fontSize: 20,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'top',
      strokeColor: '#000000',
      roughness: 1,
      opacity: 100
    } as any;

    elements.push(containerElement, labelElement);
    this.idMap.set(container.id, id.toString());

    // ✅ 保存容器位置信息（用于计算标签位置）
    this.positionMap.set(id.toString(), { x, y, width, height });

    if (container.children) {
      let childX = x + 20;
      let childY = y + 50;

      for (const child of container.children) {
        if (child.type === 'container') {
          const childElements = this.generateContainer(child, childX, childY);
          elements.push(...childElements);
          childY += (child.geometry.height || 200) + 30;
        } else if (child.type === 'node') {
          const nodeElements = this.generateNode(child, childX, childY);
          // nodeElements 现在是一个数组 [shapeElement, textElement]
          if (Array.isArray(nodeElements)) {
            elements.push(...nodeElements);
            // 使用形状元素的 ID 作为映射
            this.idMap.set(child.id, nodeElements[0].id);
          } else {
            elements.push(nodeElements);
            this.idMap.set(child.id, nodeElements.id);
          }
          childX += (child.geometry.width || 100) + 30;
        }
      }
    }

    return elements;
  }

  private generateNode(node: Node, x: number, y: number): ExcalidrawElement | ExcalidrawElement[] {
    const id = this.nextId++;
    const textId = this.nextId++;
    const { width, height, shape } = this.resolveNodeGeometry(node);

    // 创建形状元素
    const element: ExcalidrawElement = {
      type: shape === 'ellipse' ? 'ellipse' : 'rectangle',
      id: id.toString(),
      x,
      y,
      width: width || 100,
      height: height || 60,
      strokeColor: node.style?.strokeColor || '#000000',
      backgroundColor: node.style?.fillColor || 'transparent',
      fillStyle: 'solid',
      strokeWidth: node.style?.strokeWidth || 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100
    } as any;

    if (shape === 'rounded') {
      (element as any).roundness = { type:3 };
    }

    // 创建独立的文本元素
    const textElement: ExcalidrawElement = {
      type: 'text',
      id: textId.toString(),
      x: x + 10,
      y: y + (height || 60) / 2 - 10,
      width: (width || 100) - 20,
      height: 20,
      text: node.name,
      fontSize: 16,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      strokeColor: node.style?.fontColor || '#000000',
      roughness: 1,
      opacity: 100
    } as any;

    // ✅ 保存节点位置信息（使用形状的 ID）
    this.positionMap.set(id.toString(), { x, y, width: width || 100, height: height || 60 });

    // 返回形状和文本元素
    return [element, textElement];
  }

  private generateEdge(edge: Edge): ExcalidrawElement | ExcalidrawElement[] | null {
    const sourceId = this.idMap.get(edge.source);
    const targetId = this.idMap.get(edge.target);

    if (!sourceId || !targetId) {
      return null;
    }

    const id = this.nextId++;

    // 计算源元素和目标元素的位置
    const sourcePos = this.positionMap.get(sourceId);
    const targetPos = this.positionMap.get(targetId);

    // 使用简单的 points，让绑定自动计算起止点
    // points 只需要提供方向性，实际起止点由绑定决定
    let points: [[number, number], [number, number]] = [[0, 0], [1, 1]];
    let arrowX = 0;
    let arrowY = 0;

    if (sourcePos && targetPos) {
      // 计算源元素和目标元素的中心点
      const sourceCenterX = sourcePos.x + sourcePos.width / 2;
      const sourceCenterY = sourcePos.y + sourcePos.height / 2;
      const targetCenterX = targetPos.x + targetPos.width / 2;
      const targetCenterY = targetPos.y + targetPos.height / 2;

      // 箭头位置设置在两个元素之间的位置
      // 使用源元素的位置作为基准
      arrowX = Math.min(sourceCenterX, targetCenterX);
      arrowY = Math.min(sourceCenterY, targetCenterY);

      // points 提供相对路径，绑定会自动调整起止点
      points = [
        [sourceCenterX - arrowX, sourceCenterY - arrowY],
        [targetCenterX - arrowX, targetCenterY - arrowY]
      ];
    }

    const element: ExcalidrawElement = {
      type: 'arrow',
      id: id.toString(),
      x: arrowX,
      y: arrowY,
      width: 0,
      height: 0,
      strokeColor: edge.style?.strokeColor || '#000000',
      strokeWidth: edge.style?.strokeWidth || 2,
      strokeStyle: edge.style?.dashPattern ? 'dashed' : 'solid',
      roughness: 1,
      opacity: 100,
      points: points,
      lastCommittedPoint: points[points.length - 1],
      startArrowhead: null,
      endArrowhead: 'arrow',
      startBinding: {
        elementId: sourceId,
        focus: 0.5,
        gap: 4
      },
      endBinding: {
        elementId: targetId,
        focus: 0.5,
        gap: 4
      }
    } as any;

    if (edge.style?.endArrow === 'none') {
      element.endArrowhead = null;
    }

    if (edge.label) {
      const labelId = this.nextId++;

      // ✅ 计算标签位置（在边缘中点）
      const sourcePos = this.positionMap.get(sourceId);
      const targetPos = this.positionMap.get(targetId);

      let labelX = 0;
      let labelY = 0;

      if (sourcePos && targetPos) {
        // 计算源元素和目标元素的中心点
        const sourceCenterX = sourcePos.x + sourcePos.width / 2;
        const sourceCenterY = sourcePos.y + sourcePos.height / 2;
        const targetCenterX = targetPos.x + targetPos.width / 2;
        const targetCenterY = targetPos.y + targetPos.height / 2;

        // 边缘中点
        const midX = (sourceCenterX + targetCenterX) / 2;
        const midY = (sourceCenterY + targetCenterY) / 2;

        // 标签位置（中点减去标签宽度/高度的一半）
        labelX = midX - 50;  // 假设标签宽度为 100
        labelY = midY - 10;  // 假设标签高度为 20
      }

      const labelElement: ExcalidrawElement = {
        type: 'text',
        id: labelId.toString(),
        x: labelX,
        y: labelY,
        width: 100,
        height: 20,
        text: edge.label,
        fontSize: 14,
        fontFamily: 1,
        strokeColor: edge.style?.strokeColor || '#000000',
        roughness: 1,
        opacity: 100
      } as any;

      // 将标签绑定到箭头
      (labelElement as any).containerId = id.toString();

      // 在箭头上记录绑定的元素
      (element as any).boundElements = (element as any).boundElements || [];
      (element as any).boundElements.push({
        type: 'text',
        id: labelId.toString()
      });

      return [element, labelElement];
    }

    return element;
  }

  private resolveContainerGeometry(container: Container): Geometry & { fillColor: string; strokeColor: string; strokeWidth: number } {
    const defaultStyles: Record<string, any> = {
      environment: { fillColor: '#e1d5e7', strokeColor: '#9673a6', strokeWidth: 3 },
      datacenter: { fillColor: '#d5e8d4', strokeColor: '#82b366', strokeWidth: 2 },
      zone: { fillColor: '#fff2cc', strokeColor: '#d6b656', strokeWidth: 2 }
    };

    const defaults = defaultStyles[container.level || 'other'] || {
      fillColor: '#dae8fc',
      strokeColor: '#6c8ebf',
      strokeWidth: 2
    };

    return {
      x: container.geometry.x || 0,
      y: container.geometry.y || 0,
      width: container.geometry.width || 300,
      height: container.geometry.height || 200,
      fillColor: container.style?.fillColor || defaults.fillColor,
      strokeColor: container.style?.strokeColor || defaults.strokeColor,
      strokeWidth: container.style?.strokeWidth ?? defaults.strokeWidth
    };
  }

  private resolveNodeGeometry(node: Node): Geometry & { shape: string } {
    const shapes: Record<string, string> = {
      rect: 'rectangle',
      ellipse: 'ellipse',
      diamond: 'rectangle',
      parallelogram: 'rectangle',
      rounded: 'rectangle',
      cylinder: 'rectangle',
      cloud: 'rectangle',
      other: 'rectangle'
    };

    return {
      x: node.geometry.x || 0,
      y: node.geometry.y || 0,
      width: node.geometry.width || 100,
      height: node.geometry.height || 60,
      shape: shapes[node.shape || 'other'] || 'rectangle'
    };
  }
}
