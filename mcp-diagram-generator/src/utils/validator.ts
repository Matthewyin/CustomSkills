import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import { DiagramSpec } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// layers/lanes × format 支持矩阵：architecture+layers、swimlane+lanes 仅 drawio 支持
// mermaid 的 sequence/class/er 不支持容器嵌套（生成器只读顶层 node，容器内节点会被静默忽略）
const MERMAID_FLAT_DIAGRAM_TYPES = ['sequence', 'class', 'er'];

export class SchemaValidator {
  private validateSchema: ValidateFunction;

  constructor() {
    const schemaPath = path.join(__dirname, '../schemas/diagram-spec.schema.json');
    let schema: object;
    try {
      schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    } catch (error) {
      // schema 损坏时必须给出清晰错误，而不是莫名崩溃
      throw new Error(
        `Failed to load diagram spec schema at ${schemaPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    this.validateSchema = new Ajv({ allErrors: true }).compile(schema);
  }

  validate(data: unknown): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    // 结构校验：JSON Schema 是事实源（必填字段、id pattern、枚举、颜色格式等）
    if (!this.validateSchema(data)) {
      for (const error of this.validateSchema.errors || []) {
        errors.push(this.formatSchemaError(error));
      }
      // 结构不合法时直接返回，避免在残缺数据上继续做语义校验
      return { valid: false, errors };
    }

    const spec = data as DiagramSpec;

    // 语义校验：递归收集所有元素ID（包括容器子元素、layers、lanes）并查重
    const allIds = this.collectAllIds(spec.elements, errors);
    this.collectSemanticIds(spec as any, allIds, errors);

    const edgeElements = spec.elements.filter(e => e.type === 'edge') as any[];
    for (const edge of edgeElements) {
      if (!allIds.has(edge.source)) {
        errors.push(`Edge source not found: ${edge.source}`);
      }
      if (!allIds.has(edge.target)) {
        errors.push(`Edge target not found: ${edge.target}`);
      }
    }

    if (spec.diagramType === 'flowchart') {
      this.validateFlowchart(spec as any, edgeElements, errors);
    }

    this.validateContainerDepth(spec.elements, 0, errors);
    this.validateSupportMatrix(spec, errors);

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private formatSchemaError(error: ErrorObject): string {
    const location = error.instancePath || '(root)';
    const allowed = error.params?.allowedValues ?? error.params?.allowedValue;
    if (allowed !== undefined) {
      return `${location}: ${error.message} (${JSON.stringify(allowed)})`;
    }
    return `${location}: ${error.message}`;
  }

  private validateSupportMatrix(spec: DiagramSpec, errors: string[]): void {
    const hasLayers = Boolean(spec.layers && spec.layers.length > 0);
    const hasLanes = Boolean(spec.lanes && spec.lanes.length > 0);

    if ((hasLayers || hasLanes) && spec.format !== 'drawio') {
      errors.push(
        `layers/lanes are only supported with format "drawio" (architecture+layers, swimlane+lanes); got format "${spec.format}"`
      );
    }

    // drawio 的 layers/lanes 模式下顶层非 edge 元素会被生成器丢弃，必须提前报错
    const layerMode = spec.diagramType === 'architecture' && hasLayers;
    const laneMode = spec.diagramType === 'swimlane' && hasLanes;
    if (spec.format === 'drawio' && (layerMode || laneMode)) {
      const stray = spec.elements.filter(e => e.type !== 'edge');
      if (stray.length > 0) {
        errors.push(
          `elements has ${stray.length} top-level node/container that would be silently dropped in ${spec.diagramType} mode; move them into ${layerMode ? 'layers' : 'lanes'} or keep elements edge-only`
        );
      }
    }

    if (spec.format === 'mermaid' && MERMAID_FLAT_DIAGRAM_TYPES.includes(spec.diagramType || '')) {
      if (spec.elements.some(e => e.type === 'container')) {
        errors.push(
          `diagramType "${spec.diagramType}" with format "mermaid" does not support containers; flatten container children into top-level nodes`
        );
      }
    }
  }

  private validateContainerDepth(elements: any[], depth: number, errors: string[]): void {
    if (depth > 10) {
      errors.push('Container nesting too deep (>10 levels)');
      return;
    }

    for (const element of elements) {
      if (element.type === 'container' && element.children) {
        this.validateContainerDepth(element.children, depth + 1, errors);
      }
    }
  }

  private collectAllIds(elements: any[], errors: string[]): Set<string> {
    const ids = new Set<string>();

    for (const element of elements) {
      if (element.id) {
        if (ids.has(element.id)) {
          errors.push(`Duplicate element id: ${element.id}`);
        }
        ids.add(element.id);
      }

      // 递归收集容器子元素的ID
      if (element.type === 'container' && element.children) {
        const childIds = this.collectAllIds(element.children, errors);
        childIds.forEach(id => {
          if (ids.has(id)) {
            errors.push(`Duplicate element id: ${id}`);
          }
          ids.add(id);
        });
      }
    }

    return ids;
  }

  private collectSemanticIds(spec: any, ids: Set<string>, errors: string[]): void {
    for (const layer of spec.layers || []) {
      this.addId(layer.id, ids, errors);
      for (const component of layer.components || []) {
        this.addId(component.id, ids, errors);
      }
    }

    for (const lane of spec.lanes || []) {
      this.addId(lane.id, ids, errors);
      for (const step of lane.steps || []) {
        this.addId(step.id, ids, errors);
      }
    }

    for (const lane of spec.lanes || []) {
      for (const step of lane.steps || []) {
        for (const next of step.next || []) {
          if (!ids.has(next)) {
            errors.push(`Swimlane step target not found: ${next}`);
          }
        }
      }
    }
  }

  private addId(id: string | undefined, ids: Set<string>, errors: string[]): void {
    if (!id) return;
    if (ids.has(id)) {
      errors.push(`Duplicate element id: ${id}`);
    }
    ids.add(id);
  }

  private validateFlowchart(spec: any, edges: any[], errors: string[]): void {
    const nodes = this.collectNodes(spec.elements || []);

    for (const node of nodes) {
      if (node.shape !== 'diamond') continue;

      const outgoing = edges.filter(edge => edge.source === node.id);
      if (outgoing.length < 2) {
        errors.push(`Decision node must have at least two outgoing edges: ${node.id}`);
      }

      for (const edge of outgoing) {
        if (!edge.label) {
          errors.push(`Decision node outgoing edge must have a label: ${node.id} -> ${edge.target}`);
        }
      }
    }
  }

  private collectNodes(elements: any[]): any[] {
    const nodes: any[] = [];

    for (const element of elements) {
      if (element.type === 'node') {
        nodes.push(element);
      }
      if (element.type === 'container' && element.children) {
        nodes.push(...this.collectNodes(element.children));
      }
    }

    return nodes;
  }
}
