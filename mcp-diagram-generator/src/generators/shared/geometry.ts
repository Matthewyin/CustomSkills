import { Container, Geometry, Node } from '../../types.js';

// 几何工具：drawio 与 excalidraw 共用；两边常量不同，一律通过参数传入，不改变各生成器输出

// 补齐元素几何：缺失的 x/y 填 0，缺失的宽高填调用方默认值（原地修改并返回）
export function ensureGeometry(element: Container | Node, defaultWidth: number, defaultHeight: number): Geometry {
  if (!element.geometry) {
    element.geometry = { x: 0, y: 0 };
  }
  element.geometry.x = element.geometry.x ?? 0;
  element.geometry.y = element.geometry.y ?? 0;
  element.geometry.width = element.geometry.width || defaultWidth;
  element.geometry.height = element.geometry.height || defaultHeight;
  return element.geometry;
}

// 只读方式取几何，不修改元素
export function readGeometry(element: Container | Node, defaultWidth: number, defaultHeight: number): Required<Geometry> {
  return {
    x: element.geometry?.x || 0,
    y: element.geometry?.y || 0,
    width: element.geometry?.width || defaultWidth,
    height: element.geometry?.height || defaultHeight
  };
}

// 在任何默认几何填充之前，记录输入中显式指定了 x/y 的元素 id
export function markExplicitPositions(elements: any[], target: Set<string> = new Set()): Set<string> {
  for (const element of elements) {
    if (element.type === 'edge') continue;
    if (element.geometry && element.geometry.x !== undefined && element.geometry.y !== undefined) {
      target.add(element.id);
    }
    if (element.children) {
      markExplicitPositions(element.children, target);
    }
  }
  return target;
}

export interface ExpandContainerOptions {
  paddingX: number;
  paddingBottom: number;
  // true 时以容器现有尺寸为下限（excalidraw）；false 时按内容重算尺寸（drawio）
  keepCurrentSize: boolean;
}

// 调用前提：子元素几何已补齐（两个生成器的调用点都满足）
export function expandContainerToFitChildren(container: Container, options: ExpandContainerOptions): void {
  const children = container.children || [];
  if (children.length === 0) return;

  let maxRight = 0;
  let maxBottom = 0;
  for (const child of children) {
    maxRight = Math.max(maxRight, (child.geometry?.x || 0) + (child.geometry?.width || 0));
    maxBottom = Math.max(maxBottom, (child.geometry?.y || 0) + (child.geometry?.height || 0));
  }

  const current = container.geometry;
  const width = maxRight + options.paddingX;
  const height = maxBottom + options.paddingBottom;

  container.geometry = {
    x: current?.x || 0,
    y: current?.y || 0,
    width: options.keepCurrentSize ? Math.max(current?.width || 0, width) : width,
    height: options.keepCurrentSize ? Math.max(current?.height || 0, height) : height
  };
}
