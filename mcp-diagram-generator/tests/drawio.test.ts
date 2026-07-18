import { describe, expect, it } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { DrawioGenerator } from '../src/generators/drawio.js';
import { byName, hasEdgeLabel, makeTempDir, parseVertices } from './helpers.js';

const drawio = new DrawioGenerator();

const edge = (source: string, target: string, label = '连接') => ({
  type: 'edge' as const,
  source,
  target,
  label,
  style: { lineStyle: 'orthogonal' as const, endArrow: 'block' as const }
});

async function generateToTemp(spec: any, name: string): Promise<string> {
  const dir = await makeTempDir('drawio');
  const file = path.join(dir, name);
  await drawio.generate(spec, file);
  return fs.readFile(file, 'utf8');
}

describe('DrawioGenerator', () => {
  it('网络拓扑：直线无标签连线，交换机配色正确', async () => {
    const xml = await generateToTemp({
      format: 'drawio',
      title: 'regression-network-topology',
      elements: [{
        id: 'env',
        type: 'container',
        name: '生产网',
        level: 'environment',
        children: [{
          id: 'dc',
          type: 'container',
          name: '数据中心',
          level: 'datacenter',
          children: [{
            id: 'zone',
            type: 'container',
            name: '接入区',
            level: 'zone',
            children: [
              { id: 'router', type: 'node', name: '路由器', deviceType: 'router' },
              { id: 'switch', type: 'node', name: '交换机', deviceType: 'switch' },
              { id: 'core', type: 'node', name: '核心交换机', deviceType: 'coreSwitch' }
            ]
          }]
        }]
      }, edge('router', 'switch', '接入'), edge('switch', 'core', '上联')]
    }, 'network-topology.drawio');

    expect(xml).not.toContain('orthogonalEdgeStyle');
    expect(hasEdgeLabel(xml)).toBe(false);
    const vertices = parseVertices(xml);
    const switches = vertices.filter((v) => v.style.includes('fillColor=#FFFFCC'));
    expect(switches.length).toBeGreaterThanOrEqual(2);
  });

  it('架构图：层自上而下、等宽，同层组件并排', async () => {
    const xml = await generateToTemp({
      format: 'drawio',
      diagramType: 'architecture',
      title: 'regression-architecture',
      layers: [
        { id: 'user-layer', name: '用户层', components: [{ id: 'user', type: 'node', name: '用户', deviceType: 'user' }] },
        {
          id: 'service-layer',
          name: '服务层',
          components: [
            { id: 'service-a', type: 'node', name: '服务A', deviceType: 'service' },
            { id: 'service-b', type: 'node', name: '服务B', deviceType: 'service' }
          ]
        },
        { id: 'data-layer', name: '数据层', components: [{ id: 'db', type: 'node', name: '数据库', deviceType: 'database' }] }
      ],
      elements: [edge('user', 'service-a', '访问'), edge('service-a', 'db', '读写')]
    }, 'architecture.drawio');

    const cells = byName(parseVertices(xml));
    expect(cells['用户层'].y).toBeLessThan(cells['服务层'].y);
    expect(cells['服务层'].y).toBeLessThan(cells['数据层'].y);
    expect(cells['用户层'].w).toBe(cells['服务层'].w);
    expect(cells['服务层'].w).toBe(cells['数据层'].w);
    expect(cells['服务A'].x).not.toBe(cells['服务B'].x);
    expect(cells['服务A'].y).toBe(cells['服务B'].y);
  });

  it('泳道图：同 order 步骤纵向对齐，单行泳道保持紧凑', async () => {
    const xml = await generateToTemp({
      format: 'drawio',
      diagramType: 'swimlane',
      title: 'regression-swimlane',
      lanes: [
        { id: 'lane-a', name: 'A部门', steps: [{ id: 'start', name: '发起', order: 1, next: ['handle'] }, { id: 'confirm', name: '确认', order: 3 }] },
        { id: 'lane-b', name: 'B部门', steps: [{ id: 'handle', name: '处理', order: 2, next: ['confirm'] }, { id: 'record', name: '备案', order: 3 }] }
      ],
      elements: []
    }, 'swimlane.drawio');

    const cells = byName(parseVertices(xml));
    expect(cells['确认'].x).toBe(cells['备案'].x);
    expect(cells['A部门'].h).toBeLessThanOrEqual(160);
    expect(cells['B部门'].h).toBeLessThanOrEqual(160);
  });

  it('流程图：开始节点圆角、判断节点菱形、主流程纵向排列', async () => {
    const xml = await generateToTemp({
      format: 'drawio',
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
    }, 'flowchart.drawio');

    const cells = byName(parseVertices(xml));
    expect(cells['开始'].style).toContain('rounded=1');
    expect(cells['审批通过?'].style).toContain('shape=diamond');
    expect(cells['开始'].y).toBeLessThan(cells['提交申请'].y);
    expect(cells['提交申请'].y).toBeLessThan(cells['审批通过?'].y);
  });

  it('显式 (0,0) 坐标被尊重，不再被当作未指定', async () => {
    const xml = await generateToTemp({
      format: 'drawio',
      title: 'explicit-zero',
      elements: [
        { id: 'origin', type: 'node', name: '原点节点', geometry: { x: 0, y: 0 } },
        { id: 'other', type: 'node', name: '其他节点' }
      ]
    }, 'explicit-zero.drawio');

    const cells = byName(parseVertices(xml));
    expect(cells['原点节点'].x).toBe(0);
    expect(cells['原点节点'].y).toBe(0);
  });

  it('style 中的恶意属性值会被 XML 转义', async () => {
    const xml = await generateToTemp({
      format: 'drawio',
      title: 'escape-check',
      elements: [
        { id: 'a', type: 'node', name: 'A', style: { fillColor: '#FFFFFF" malicious="1' } }
      ]
    }, 'escape-check.drawio');

    expect(xml).not.toContain('malicious="1');
    expect(xml).toContain('&quot;');
  });
});
