import { describe, expect, it } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { ExcalidrawGenerator } from '../src/generators/excalidraw.js';
import { makeTempDir } from './helpers.js';

const excalidraw = new ExcalidrawGenerator();

interface Point { x: number; y: number }
interface Rect { x: number; y: number; width: number; height: number }

function isOnRectangleBoundary(point: Point, rect: Rect): boolean {
  const epsilon = 0.1;
  const onLeft = Math.abs(point.x - rect.x) < epsilon;
  const onRight = Math.abs(point.x - (rect.x + rect.width)) < epsilon;
  const onTop = Math.abs(point.y - rect.y) < epsilon;
  const onBottom = Math.abs(point.y - (rect.y + rect.height)) < epsilon;
  const withinX = point.x >= rect.x - epsilon && point.x <= rect.x + rect.width + epsilon;
  const withinY = point.y >= rect.y - epsilon && point.y <= rect.y + rect.height + epsilon;

  return ((onLeft || onRight) && withinY) || ((onTop || onBottom) && withinX);
}

function isCenter(point: Point, rect: Rect): boolean {
  const epsilon = 0.1;
  return Math.abs(point.x - (rect.x + rect.width / 2)) < epsilon
    && Math.abs(point.y - (rect.y + rect.height / 2)) < epsilon;
}

describe('ExcalidrawGenerator', () => {
  it('箭头绑定源/目标元素边缘，标签与图形绑定分组', async () => {
    const dir = await makeTempDir('excalidraw');
    const file = path.join(dir, 'edge-binding.excalidraw');
    await excalidraw.generate({
      format: 'excalidraw',
      title: 'regression-excalidraw',
      elements: [
        {
          id: 'scope',
          type: 'container',
          name: '业务容器',
          children: [{ id: 'inside', type: 'node', name: '内部节点' }]
        },
        { id: 'source', type: 'node', name: '源节点' },
        { id: 'target', type: 'node', name: '目标节点' },
        { type: 'edge', source: 'source', target: 'target', label: '调用' }
      ]
    } as any, file);

    const data = JSON.parse(await fs.readFile(file, 'utf8'));
    const arrow = data.elements.find((element: any) => element.type === 'arrow');
    expect(arrow).toBeTruthy();
    expect(arrow.startBinding?.elementId).toBeTruthy();
    expect(arrow.endBinding?.elementId).toBeTruthy();
    expect(arrow.startBinding.gap).toBe(0);
    expect(arrow.endBinding.gap).toBe(0);

    const source = data.elements.find((element: any) => element.id === arrow.startBinding.elementId);
    const target = data.elements.find((element: any) => element.id === arrow.endBinding.elementId);
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();
    expect(source.boundElements?.some((element: any) => element.id === arrow.id)).toBe(true);
    expect(target.boundElements?.some((element: any) => element.id === arrow.id)).toBe(true);
    expect(source.x !== target.x || source.y !== target.y).toBe(true);

    const startPoint = { x: arrow.x + arrow.points[0][0], y: arrow.y + arrow.points[0][1] };
    const endPoint = { x: arrow.x + arrow.points[1][0], y: arrow.y + arrow.points[1][1] };
    expect(isOnRectangleBoundary(startPoint, source)).toBe(true);
    expect(isOnRectangleBoundary(endPoint, target)).toBe(true);
    expect(isCenter(startPoint, source)).toBe(false);
    expect(isCenter(endPoint, target)).toBe(false);

    const label = data.elements.find((element: any) => element.type === 'text' && element.text === '调用');
    expect(label).toBeTruthy();
    expect(label.y + label.height < arrow.y || label.y > arrow.y).toBe(true);
    expect(label.width).toBeLessThan(endPoint.x - startPoint.x);

    const sourceLabel = data.elements.find((element: any) => element.type === 'text' && element.text === '源节点');
    expect(sourceLabel?.containerId).toBe(source.id);
    expect(source.groupIds?.[0]).toBe(sourceLabel.groupIds?.[0]);
    expect(source.boundElements?.some((element: any) => element.id === sourceLabel.id)).toBe(true);

    const containerLabel = data.elements.find((element: any) => element.type === 'text' && element.text === '业务容器');
    const containerShape = data.elements.find((element: any) => element.id === containerLabel?.containerId);
    expect(containerShape?.backgroundColor).toBe('transparent');
    expect(containerShape.groupIds?.[0]).toBe(containerLabel.groupIds?.[0]);
    expect(containerShape.boundElements?.some((element: any) => element.id === containerLabel.id)).toBe(true);
  });

  it('显式 (0,0) 坐标被尊重，不再被当作未指定', async () => {
    const dir = await makeTempDir('excalidraw');
    const file = path.join(dir, 'zero.excalidraw');
    await excalidraw.generate({
      format: 'excalidraw',
      title: 'explicit-zero',
      elements: [
        { id: 'origin', type: 'node', name: '原点', geometry: { x: 0, y: 0 } },
        { id: 'far', type: 'node', name: '远处', geometry: { x: 500, y: 500 } }
      ]
    } as any, file);

    const data = JSON.parse(await fs.readFile(file, 'utf8'));
    const shapes = data.elements.filter((element: any) => element.type !== 'text');
    expect(shapes.some((element: any) => element.x === 0 && element.y === 0)).toBe(true);
    expect(shapes.some((element: any) => element.x === 500 && element.y === 500)).toBe(true);
  });

  it('生成过程不修改调用方传入的 spec 对象', async () => {
    const spec = {
      format: 'excalidraw',
      title: 'no-mutation',
      elements: [
        { id: 'a', type: 'node', name: 'A' },
        { id: 'b', type: 'node', name: 'B' },
        { type: 'edge', source: 'a', target: 'b' }
      ]
    };
    const snapshot = JSON.stringify(spec);

    const dir = await makeTempDir('excalidraw');
    await excalidraw.generate(spec as any, path.join(dir, 'a.excalidraw'));
    expect(JSON.stringify(spec)).toBe(snapshot);
  });
});
