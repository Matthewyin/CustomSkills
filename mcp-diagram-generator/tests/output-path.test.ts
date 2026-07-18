import { describe, expect, it } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { resolveConfiguredPath, resolveDiagramOutputPath } from '../src/utils/output-path.js';
import { makeTempDir } from './helpers.js';

describe('resolveDiagramOutputPath', () => {
  it('默认路径必须补齐文件扩展名', async () => {
    const root = await makeTempDir('output-path');
    const result = await resolveDiagramOutputPath({
      projectRoot: root,
      defaultDir: 'diagrams/drawio',
      format: 'drawio',
      filename: 'default-name'
    });
    expect(result).toBe(path.join(root, 'diagrams/drawio/default-name.drawio'));
  });

  it('目录式 output_path 必须拼接文件名', async () => {
    const root = await makeTempDir('output-path');
    const result = await resolveDiagramOutputPath({
      projectRoot: root,
      defaultDir: 'diagrams/drawio',
      format: 'drawio',
      outputPath: 'custom/drawio',
      filename: 'from-dir'
    });
    expect(result).toBe(path.join(root, 'custom/drawio/from-dir.drawio'));
  });

  it('文件式 output_path 必须保持原文件名', async () => {
    const root = await makeTempDir('output-path');
    const result = await resolveDiagramOutputPath({
      projectRoot: root,
      defaultDir: 'diagrams/drawio',
      format: 'drawio',
      outputPath: 'custom/file.drawio',
      filename: 'ignored'
    });
    expect(result).toBe(path.join(root, 'custom/file.drawio'));
  });

  it('已存在目录即使带点号也必须按目录处理', async () => {
    const root = await makeTempDir('output-path');
    const existingDir = path.join(root, 'existing.v1');
    await fs.mkdir(existingDir, { recursive: true });
    const result = await resolveDiagramOutputPath({
      projectRoot: root,
      defaultDir: 'diagrams/drawio',
      format: 'drawio',
      outputPath: 'existing.v1',
      filename: 'inside'
    });
    expect(result).toBe(path.join(existingDir, 'inside.drawio'));
  });

  it('mermaid 默认扩展名为 .mmd，同时兼容 .md', async () => {
    const root = await makeTempDir('output-path');
    const result = await resolveDiagramOutputPath({
      projectRoot: root,
      defaultDir: 'diagrams/mermaid',
      format: 'mermaid',
      filename: 'auto'
    });
    expect(result).toBe(path.join(root, 'diagrams/mermaid/auto.mmd'));

    const keepMd = await resolveDiagramOutputPath({
      projectRoot: root,
      defaultDir: 'diagrams/mermaid',
      format: 'mermaid',
      filename: 'legacy.md'
    });
    expect(keepMd).toBe(path.join(root, 'diagrams/mermaid/legacy.md'));
  });
});

describe('resolveConfiguredPath', () => {
  it('绝对路径原样返回，不被拼接到 projectRoot', () => {
    const absolute = path.resolve('/tmp/absolute-diagram-dir');
    expect(resolveConfiguredPath('/some/project', absolute)).toBe(absolute);
  });

  it('相对路径拼接到 projectRoot', () => {
    expect(resolveConfiguredPath('/some/project', 'diagrams/drawio')).toBe(
      path.join('/some/project', 'diagrams/drawio')
    );
  });
});
