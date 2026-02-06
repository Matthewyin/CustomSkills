import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { DiagramSpec } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SchemaValidator {
  private spec: any;

  constructor() {
    const schemaPath = path.join(__dirname, '../schemas/diagram-spec.schema.json');
    this.spec = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  }

  validate(data: unknown): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data !== 'object' || data === null) {
      return { valid: false, errors: ['Root must be an object'] };
    }

    const spec = data as DiagramSpec;

    if (!spec.format || !['drawio', 'mermaid', 'excalidraw'].includes(spec.format)) {
      errors.push(`Invalid format: ${spec.format}`);
    }

    if (!Array.isArray(spec.elements)) {
      errors.push('elements must be an array');
      return { valid: false, errors };
    }

    for (const element of spec.elements) {
      if (!element.type || !['container', 'node', 'edge'].includes(element.type)) {
        errors.push(`Invalid element type: ${element.type}`);
      }

      if (!element.id) {
        errors.push('Element missing id');
      }
    }

    // 递归收集所有元素ID（包括容器内的子元素）
    const allIds = this.collectAllIds(spec.elements);

    const edgeElements = spec.elements.filter(e => e.type === 'edge') as any[];
    for (const edge of edgeElements) {
      if (!allIds.has(edge.source)) {
        errors.push(`Edge source not found: ${edge.source}`);
      }
      if (!allIds.has(edge.target)) {
        errors.push(`Edge target not found: ${edge.target}`);
      }
    }

    const validateContainer = (container: any, depth = 0): void => {
      if (depth > 10) {
        errors.push('Container nesting too deep (>10 levels)');
        return;
      }

      if (container.children) {
        for (const child of container.children) {
          if (child.type === 'container') {
            validateContainer(child, depth + 1);
          }
        }
      }
    };

    for (const element of spec.elements) {
      if (element.type === 'container') {
        validateContainer(element);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private collectAllIds(elements: any[]): Set<string> {
    const ids = new Set<string>();

    for (const element of elements) {
      if (element.id) {
        ids.add(element.id);
      }

      // 递归收集容器子元素的ID
      if (element.type === 'container' && element.children) {
        const childIds = this.collectAllIds(element.children);
        childIds.forEach(id => ids.add(id));
      }
    }

    return ids;
  }
}
