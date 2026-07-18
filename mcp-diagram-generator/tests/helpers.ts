import fs from 'fs/promises';
import os from 'os';
import path from 'path';

// 测试输出统一写到临时目录，避免污染工作区
export async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), `diagram-test-${prefix}-`));
}

export interface ParsedVertex {
  id: string;
  value: string;
  style: string;
  parent: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// 结构化解析 drawio mxCell 顶点，断言基于解析后的字段而非脆弱正则
export function parseVertices(xml: string): ParsedVertex[] {
  return [...xml.matchAll(/<mxCell id="([^"]+)" value="([^"]*)" style="([^"]*)" parent="([^"]*)" vertex="1">[\s\S]*?<mxGeometry x="([^"]*)" y="([^"]*)" width="([^"]*)" height="([^"]*)"/g)]
    .map((match) => ({
      id: match[1],
      value: match[2],
      style: match[3],
      parent: match[4],
      x: Number(match[5]),
      y: Number(match[6]),
      w: Number(match[7]),
      h: Number(match[8])
    }));
}

export function byName(vertices: ParsedVertex[]): Record<string, ParsedVertex> {
  return Object.fromEntries(vertices.map((vertex) => [vertex.value, vertex]));
}

export function hasEdgeLabel(xml: string): boolean {
  return /<mxCell id="[^"]+" value="[^"]+" style="[^"]+" parent="[^"]+" source="/.test(xml);
}
