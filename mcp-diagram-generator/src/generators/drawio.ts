import * as fs from 'fs/promises';
import * as path from 'path';
import { DiagramSpec, Container, Node, Edge, Style } from '../types.js';

export class DrawioGenerator {
  private nextCellId = 1;
  private idMap = new Map<string, string>();
  private flatNodes: Array<{ id: string; element: Container | Node; parentId: string }> = [];
  private flatEdges: Edge[] = [];

  async generate(spec: DiagramSpec, outputPath: string): Promise<void> {
    const xml = this.generateXml(spec);
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outputPath, xml, 'utf-8');
  }

  private generateXml(spec: DiagramSpec): string {
    this.resetState();

    this.flattenElements(spec.elements);

    const pageWidth = 1654;
    const pageHeight = 2339;

    const childrenXml = this.buildChildrenXml();
    const edgesXml = this.buildEdgesXml();

    return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Electron" agent="Claude MCP Server" version="1.0.0" pages="1">
  <diagram name="${this.escapeXml(spec.title || 'diagram')}" id="diagram-1">
    <mxGraphModel dx="1426" dy="840" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${pageWidth}" pageHeight="${pageHeight}" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="root-parent" parent="0" />
${childrenXml}${edgesXml}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  }

  private resetState(): void {
    this.nextCellId = 1;
    this.idMap.clear();
    this.flatNodes = [];
    this.flatEdges = [];
  }

  private flattenElements(elements: any[]): void {
    for (const element of elements) {
      if (element.type === 'edge') {
        this.flatEdges.push(element);
      } else {
        this.flattenNode(element, 'root-parent');
      }
    }
  }

  private flattenNode(element: Container | Node, parentId: string): void {
    const cellId = (this.nextCellId++).toString();
    this.idMap.set(element.id, cellId);
    this.flatNodes.push({ id: cellId, element, parentId });

    if (element.type === 'container' && element.children) {
      for (const child of element.children) {
        this.flattenNode(child, cellId);
      }
    }
  }

  private buildChildrenXml(): string {
    return this.flatNodes
      .map(({ id, element, parentId }) => {
        if (element.type === 'container') {
          return this.buildContainerXml(id, element, parentId);
        } else {
          return this.buildNodeXml(id, element, parentId);
        }
      })
      .join('\n');
  }

  private buildContainerXml(id: string, container: Container, parentId: string): string {
    const style = this.buildContainerStyle(container.style, container.level);
    const { x, y, width, height } = container.geometry;
    const name = this.escapeXml(container.name);

    // 计算相对于父容器的坐标
    const { relX, relY } = this.getRelativeCoordinates(x, y, parentId);

    return `        <mxCell id="${id}" value="${name}" style="${style}" parent="${parentId}" vertex="1">
          <mxGeometry x="${relX}" y="${relY}" width="${width}" height="${height}" as="geometry" />
        </mxCell>`;
  }

  private buildNodeXml(id: string, node: Node, parentId: string): string {
    const style = this.buildNodeStyle(node.style, node.deviceType, node.shape);
    const { x, y, width, height } = node.geometry;
    const name = this.escapeXml(node.name);

    // 计算相对于父容器的坐标
    const { relX, relY } = this.getRelativeCoordinates(x, y, parentId);

    return `        <mxCell id="${id}" value="${name}" style="${style}" parent="${parentId}" vertex="1">
          <mxGeometry x="${relX}" y="${relY}" width="${width}" height="${height}" as="geometry" />
        </mxCell>`;
  }

  private getRelativeCoordinates(x: number, y: number, parentId: string): { relX: number; relY: number } {
    // 如果父元素是 root-parent，使用绝对坐标
    if (parentId === 'root-parent') {
      return { relX: x, relY: y };
    }

    // 查找父容器并计算相对坐标
    const parent = this.flatNodes.find(n => n.id === parentId);
    if (parent && parent.element.type === 'container') {
      const parentX = parent.element.geometry.x || 0;
      const parentY = parent.element.geometry.y || 0;
      return {
        relX: x - parentX,
        relY: y - parentY
      };
    }

    // 默认返回绝对坐标
    return { relX: x, relY: y };
  }

  private buildEdgesXml(): string {
    return this.flatEdges
      .map((edge, index) => {
        const cellId = (this.nextCellId++).toString();
        const sourceId = this.idMap.get(edge.source) || edge.source;
        const targetId = this.idMap.get(edge.target) || edge.target;
        const style = this.buildEdgeStyle(edge.style);
        const label = edge.label ? ` value="${this.escapeXml(edge.label)}"` : '';

        return `        <mxCell id="${cellId}"${label} style="${style}" parent="root-parent" source="${sourceId}" target="${targetId}" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="0" y="0" as="sourcePoint" />
            <mxPoint x="0" y="0" as="targetPoint" />
          </mxGeometry>
        </mxCell>`;
      })
      .join('\n');
  }

  private buildContainerStyle(style?: Style, level?: string): string {
    const defaults = this.getDefaultContainerStyle(level);
    const merged = { ...defaults, ...style };
    return `swimlane;whiteSpace=wrap;html=1;${this.styleToString(merged)}`;
  }

  private buildNodeStyle(style?: Style, deviceType?: string, shape?: string): string {
    const defaults = this.getDefaultNodeStyle(deviceType);
    const merged = { ...defaults, ...style };

    let shapeStyle = 'shape=rect';
    if (shape) {
      const shapeMap: Record<string, string> = {
        rect: 'shape=rect',
        ellipse: 'shape=ellipse',
        diamond: 'shape=diamond',
        parallelogram: 'shape=parallelogram',
        rounded: 'rounded=1;shape=rect',
        cylinder: 'shape=cylinder3',
        cloud: 'shape=cloud'
      };
      shapeStyle = shapeMap[shape] || 'shape=rect';
    }

    return `${shapeStyle};${this.styleToString(merged)}`;
  }

  private buildEdgeStyle(style?: any): string {
    const defaults: any = {
      endArrow: 'none',
      lineStyle: 'straight'
    };
    const merged = { ...defaults, ...style };

    let result = 'html=1;rounded=0;endFill=0;';

    if (merged.endArrow && merged.endArrow !== 'none') {
      result = `html=1;rounded=0;endFill=1;endArrow=${merged.endArrow};`;
    }

    if (merged.startArrow && merged.startArrow !== 'none') {
      result += `startArrow=${merged.startArrow};`;
    }

    if (merged.lineStyle === 'orthogonal') {
      result += `rounded=1;`;
    }

    if (merged.strokeColor) {
      result += `strokeColor=${merged.strokeColor};`;
    }

    if (merged.strokeWidth) {
      result += `strokeWidth=${merged.strokeWidth};`;
    }

    if (merged.dashPattern) {
      result += `dashed=1;dashPattern=${merged.dashPattern};`;
    }

    return result;
  }

  private getDefaultContainerStyle(level?: string): Style {
    const levelStyles: Record<string, Style> = {
      environment: {
        fillColor: '#e1d5e7',
        strokeColor: '#9673a6',
        fontSize: 14,
        fontStyle: 'bold'
      },
      datacenter: {
        fillColor: '#d5e8d4',
        strokeColor: '#82b366',
        fontSize: 12,
        fontStyle: 'bold'
      },
      zone: {
        fillColor: '#fff2cc',
        strokeColor: '#d6b656',
        fontSize: 10,
        fontStyle: 'bold'
      },
      other: {
        fillColor: '#dae8fc',
        strokeColor: '#6c8ebf'
      }
    };

    return levelStyles[level || 'other'] || {};
  }

  private getDefaultNodeStyle(deviceType?: string): Style {
    const deviceStyles: Record<string, Style> = {
      router: { strokeColor: '#607D8B', strokeWidth: 2, fillColor: 'none' },
      switch: { strokeColor: '#4CAF50', strokeWidth: 2, fillColor: 'none' },
      firewall: { strokeColor: '#F44336', strokeWidth: 2, fillColor: 'none' },
      server: { strokeColor: '#2196F3', strokeWidth: 2, fillColor: 'none' },
      pc: { strokeColor: '#607D8B', strokeWidth: 2, fillColor: 'none' },
      database: { strokeColor: '#9C27B0', strokeWidth: 2, fillColor: 'none' },
      cloud: { strokeColor: '#9E9E9E', strokeWidth: 2, fillColor: 'none' },
      other: { strokeColor: '#333333', strokeWidth: 2, fillColor: 'none' }
    };

    return deviceStyles[deviceType || 'other'] || {
      strokeColor: '#333333',
      strokeWidth: 2,
      fillColor: 'none',
      fontSize: 12
    };
  }

  private styleToString(style: Style): string {
    const parts: string[] = [];

    if (style.fillColor) parts.push(`fillColor=${style.fillColor}`);
    if (style.strokeColor) parts.push(`strokeColor=${style.strokeColor}`);
    if (style.strokeWidth) parts.push(`strokeWidth=${style.strokeWidth}`);
    if (style.fontColor) parts.push(`fontColor=${style.fontColor}`);
    if (style.fontSize) parts.push(`fontSize=${style.fontSize}`);
    if (style.fontStyle === 'bold') parts.push('fontStyle=1');
    if (style.fontStyle === 'italic') parts.push('fontStyle=2');

    return parts.join(';');
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
