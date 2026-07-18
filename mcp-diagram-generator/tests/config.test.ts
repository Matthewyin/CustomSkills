import { describe, expect, it } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { ConfigManager } from '../src/config.js';
import { makeTempDir } from './helpers.js';

describe('ConfigManager', () => {
  it('配置文件不存在时静默回退默认配置', async () => {
    const dir = await makeTempDir('config');
    const config = await new ConfigManager(dir).load();
    expect(config.defaultOutputPaths.mermaid).toBe('diagrams/mermaid');
    expect(config.initialized).toBe(false);
  });

  it('损坏的 .diagram-config.json 抛出清晰错误', async () => {
    const dir = await makeTempDir('config');
    await fs.writeFile(path.join(dir, '.diagram-config.json'), '{broken json');
    await expect(new ConfigManager(dir).load()).rejects.toThrow('Failed to load config file');
  });

  it('setOutputPath 拒绝非法 format，不写入垃圾 key', async () => {
    const dir = await makeTempDir('config');
    const manager = new ConfigManager(dir);
    await manager.load();
    await expect(manager.setOutputPath('bogus' as any, 'x')).rejects.toThrow('Invalid format');
    // 配置文件不应被写出
    await expect(fs.stat(path.join(dir, '.diagram-config.json'))).rejects.toThrow();
  });

  it('ensureDirectoriesExist 支持绝对路径配置', async () => {
    const projectDir = await makeTempDir('config');
    const absoluteDir = await makeTempDir('config-absolute');
    const manager = new ConfigManager(projectDir);
    await manager.load();
    await manager.setOutputPath('drawio', absoluteDir);

    await manager.ensureDirectoriesExist(projectDir);

    // 绝对路径目录原样可用，且不会在 projectRoot 下错误拼接出嵌套目录
    const stat = await fs.stat(absoluteDir);
    expect(stat.isDirectory()).toBe(true);
    await expect(fs.stat(path.join(projectDir, absoluteDir))).rejects.toThrow();
  });
});
