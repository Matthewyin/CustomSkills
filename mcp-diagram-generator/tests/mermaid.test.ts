import { describe, expect, it } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { MermaidGenerator } from '../src/generators/mermaid.js';
import { makeTempDir } from './helpers.js';

const mermaid = new MermaidGenerator();

async function generateToTemp(spec: any, name: string): Promise<string> {
  const dir = await makeTempDir('mermaid');
  const file = path.join(dir, name);
  await mermaid.generate(spec, file);
  return fs.readFile(file, 'utf8');
}

describe('MermaidGenerator', () => {
  it('流程图：flowchart TD、圆角开始节点、菱形判断节点、判断边带标签', async () => {
    const text = await generateToTemp({
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
    }, 'flowchart.mmd');

    expect(text).toContain('flowchart TD');
    expect(text).toContain('start("开始")');
    expect(text).toContain('review{"审批通过?"}');
    expect(text).toContain('|通过|');
    expect(text).toContain('|拒绝|');
  });

  it('类图：输出字段方法，支持继承/组合/依赖关系', async () => {
    const text = await generateToTemp({
      format: 'mermaid',
      diagramType: 'class',
      title: 'regression-class',
      elements: [
        { id: 'entity', type: 'node', name: 'Entity', fields: ['+String id'], methods: ['+validate()'] },
        { id: 'order', type: 'node', name: 'Order', fields: ['+String orderNo', '+Money amount'], methods: ['+pay()'] },
        { id: 'item', type: 'node', name: 'OrderItem', fields: ['+String sku', '+int quantity'] },
        { type: 'edge', source: 'entity', target: 'order', relation: 'inheritance' },
        { type: 'edge', source: 'order', target: 'item', relation: 'composition', label: 'items' },
        { type: 'edge', source: 'order', target: 'entity', relation: 'dependency', label: 'validates' }
      ]
    }, 'class.mmd');

    expect(text).toContain('+String orderNo');
    expect(text).toContain('+pay()');
    expect(text).toContain('entity <|-- order');
    expect(text).toContain('order *-- item : items');
    expect(text).toContain('order ..> entity : validates');
  });

  it('ER 图：输出字段类型与 FK 标记、一对多基数', async () => {
    const text = await generateToTemp({
      format: 'mermaid',
      diagramType: 'er',
      title: 'regression-er',
      elements: [
        { id: 'customer', type: 'node', name: 'CUSTOMER', fields: ['int id PK', 'string name'] },
        { id: 'orders', type: 'node', name: 'ORDERS', fields: ['int id PK', 'int customer_id FK', 'datetime created_at'] },
        { type: 'edge', source: 'customer', target: 'orders', relation: 'oneToMany', label: 'places' }
      ]
    }, 'er.mmd');

    expect(text).toContain('int customer_id FK');
    expect(text).toContain('customer ||--o{ orders : "places"');
  });

  it('时序图：参与者按消息首次出现排序，支持返回与异步消息', async () => {
    const text = await generateToTemp({
      format: 'mermaid',
      diagramType: 'sequence',
      title: 'regression-sequence',
      elements: [
        { id: 'browser', type: 'node', name: '浏览器' },
        { id: 'api', type: 'node', name: 'API服务' },
        { id: 'mq', type: 'node', name: '消息队列' },
        { id: 'db', type: 'node', name: '数据库' },
        { type: 'edge', source: 'browser', target: 'api', label: '提交订单', relation: 'sync' },
        { type: 'edge', source: 'api', target: 'db', label: '写入订单', relation: 'sync' },
        { type: 'edge', source: 'db', target: 'api', label: '订单ID', relation: 'return' },
        { type: 'edge', source: 'api', target: 'mq', label: '发布订单事件', relation: 'async' }
      ]
    }, 'sequence.mmd');

    expect(text.indexOf('participant browser')).toBeLessThan(text.indexOf('participant api'));
    expect(text).toContain('db-->>api: 订单ID');
    expect(text).toContain('api-)mq: 发布订单事件');
  });

  it('边 label 中的双引号会被转义，不破坏语法', async () => {
    const text = await generateToTemp({
      format: 'mermaid',
      diagramType: 'flowchart',
      title: 'label-escape',
      elements: [
        { id: 'a', type: 'node', name: 'A' },
        { id: 'b', type: 'node', name: 'B' },
        { type: 'edge', source: 'a', target: 'b', label: '含"引号' }
      ]
    }, 'label-escape.mmd');

    expect(text).toContain('|含&quot;引号|');
  });

  it('生成过程不修改调用方传入的 spec 对象', async () => {
    const spec = {
      format: 'mermaid',
      diagramType: 'flowchart',
      title: 'no-mutation',
      elements: [
        { id: 'start', type: 'node', name: '开始' },
        { id: 'end', type: 'node', name: '结束' },
        { type: 'edge', source: 'start', target: 'end', label: '走' }
      ]
    };
    const snapshot = JSON.stringify(spec);

    const dir = await makeTempDir('mermaid');
    await mermaid.generate(spec as any, path.join(dir, 'a.mmd'));
    expect(JSON.stringify(spec)).toBe(snapshot);
  });
});
