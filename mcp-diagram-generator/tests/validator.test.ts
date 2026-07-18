import { describe, expect, it } from 'vitest';
import { SchemaValidator } from '../src/utils/validator.js';

const validator = new SchemaValidator();

function expectInvalid(spec: unknown, messagePart: string): string[] {
  const result = validator.validate(spec);
  expect(result.valid).toBe(false);
  const errors = result.errors || [];
  expect(
    errors.some((error) => error.includes(messagePart)),
    `期望错误包含 "${messagePart}"，实际: ${errors.join(' ; ')}`
  ).toBe(true);
  return errors;
}

describe('SchemaValidator 正例', () => {
  it('合法 flowchart spec 通过校验', () => {
    const result = validator.validate({
      format: 'mermaid',
      diagramType: 'flowchart',
      title: 'regression-flowchart',
      elements: [
        { id: 'start', type: 'node', name: '开始' },
        { id: 'submit', type: 'node', name: '提交申请' },
        { id: 'review', type: 'node', name: '审批通过?', shape: 'diamond' },
        { id: 'done', type: 'node', name: '完成' },
        { id: 'reject', type: 'node', name: '退回修改' },
        { type: 'edge', source: 'start', target: 'submit' },
        { type: 'edge', source: 'submit', target: 'review' },
        { type: 'edge', source: 'review', target: 'done', label: '通过' },
        { type: 'edge', source: 'review', target: 'reject', label: '拒绝' },
        { type: 'edge', source: 'reject', target: 'submit', label: '重新提交' }
      ]
    });
    expect(result.valid).toBe(true);
  });

  it('fillColor "none" 与 endArrow "block" 通过校验', () => {
    const result = validator.validate({
      format: 'drawio',
      elements: [
        { id: 'a', type: 'node', name: 'A', style: { fillColor: 'none' } },
        { id: 'b', type: 'node', name: 'B' },
        { type: 'edge', source: 'a', target: 'b', style: { endArrow: 'block' } }
      ]
    });
    expect(result.valid).toBe(true);
  });
});

describe('SchemaValidator 负例', () => {
  it('重复 id 报错', () => {
    expectInvalid({
      format: 'drawio',
      elements: [
        { id: 'a', type: 'node', name: 'A' },
        { id: 'a', type: 'node', name: 'A2' }
      ]
    }, 'Duplicate element id: a');
  });

  it('容器内外重复 id 也能被递归查出', () => {
    expectInvalid({
      format: 'drawio',
      elements: [
        { id: 'a', type: 'node', name: 'A' },
        { id: 'c', type: 'container', name: 'C', children: [{ id: 'a', type: 'node', name: 'A2' }] }
      ]
    }, 'Duplicate element id: a');
  });

  it('悬空 edge（source/target 不可解析）报错', () => {
    expectInvalid({
      format: 'drawio',
      elements: [
        { id: 'a', type: 'node', name: 'A' },
        { type: 'edge', source: 'a', target: 'ghost' }
      ]
    }, 'Edge target not found: ghost');
  });

  it('容器嵌套超过 10 层报错', () => {
    let inner: any = { id: 'leaf', type: 'node', name: '叶子' };
    for (let i = 0; i < 12; i++) {
      inner = { id: `c${i}`, type: 'container', name: `层${i}`, children: [inner] };
    }
    expectInvalid({ format: 'drawio', elements: [inner] }, 'Container nesting too deep');
  });

  it('非法颜色值报错', () => {
    expectInvalid({
      format: 'drawio',
      elements: [{ id: 'a', type: 'node', name: 'A', style: { fillColor: 'red' } }]
    }, 'fillColor');
  });

  it('非法 id 字符报错', () => {
    expectInvalid({
      format: 'drawio',
      elements: [{ id: 'a.b', type: 'node', name: 'A' }]
    }, 'pattern');
  });
});

describe('支持矩阵：不合法组合报错而非静默丢元素', () => {
  const layerSpec = {
    diagramType: 'architecture',
    layers: [{ id: 'l1', name: 'L', components: [{ id: 'a', type: 'node', name: 'A' }] }],
    elements: []
  };

  it('layers + 非 drawio format 报错', () => {
    expectInvalid({ ...layerSpec, format: 'mermaid' }, 'only supported with format "drawio"');
    expectInvalid({ ...layerSpec, format: 'excalidraw' }, 'only supported with format "drawio"');
  });

  it('lanes + 非 drawio format 报错', () => {
    expectInvalid({
      format: 'mermaid',
      diagramType: 'swimlane',
      lanes: [{ id: 'lane', name: '泳道', steps: [{ id: 's1', name: '步骤' }] }],
      elements: []
    }, 'only supported with format "drawio"');
  });

  it('drawio layers 模式混入顶层 node 报错（防止静默丢弃）', () => {
    expectInvalid({
      ...layerSpec,
      format: 'drawio',
      elements: [{ id: 'stray', type: 'node', name: '游离节点' }]
    }, 'silently dropped');
  });

  it('drawio swimlane 模式混入顶层 container 报错（防止静默丢弃）', () => {
    expectInvalid({
      format: 'drawio',
      diagramType: 'swimlane',
      lanes: [{ id: 'lane', name: '泳道', steps: [{ id: 's1', name: '步骤' }] }],
      elements: [{ id: 'stray', type: 'container', name: '游离容器' }]
    }, 'silently dropped');
  });

  it.each(['sequence', 'class', 'er'])('mermaid %s + 容器报错（防止生成非法 mermaid）', (diagramType) => {
    expectInvalid({
      format: 'mermaid',
      diagramType,
      elements: [
        { id: 'c', type: 'container', name: 'C', children: [{ id: 'n', type: 'node', name: 'N' }] }
      ]
    }, 'does not support containers');
  });

  it('drawio layers 模式 elements 仅含 edge 时通过', () => {
    const result = validator.validate({
      ...layerSpec,
      format: 'drawio',
      elements: [{ type: 'edge', source: 'a', target: 'a2' }],
      layers: [
        { id: 'l1', name: 'L', components: [{ id: 'a', type: 'node', name: 'A' }] },
        { id: 'l2', name: 'L2', components: [{ id: 'a2', type: 'node', name: 'A2' }] }
      ]
    });
    expect(result.valid).toBe(true);
  });
});
