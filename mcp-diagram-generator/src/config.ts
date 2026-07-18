import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { resolveConfiguredPath } from './utils/output-path.js';

export interface DiagramConfig {
  defaultOutputPaths: {
    drawio: string;
    mermaid: string;
    excalidraw: string;
  };
  initialized: boolean;
}

const DEFAULT_CONFIG: DiagramConfig = {
  defaultOutputPaths: {
    drawio: 'diagrams/drawio',
    mermaid: 'diagrams/mermaid',
    excalidraw: 'diagrams/excalidraw'
  },
  initialized: false
};

const CONFIG_FILE = '.diagram-config.json';

export class ConfigManager {
  private config: DiagramConfig;
  private configPath: string;

  constructor(projectRoot: string) {
    this.configPath = path.join(projectRoot, CONFIG_FILE);
    this.config = { ...DEFAULT_CONFIG };
  }

  async load(): Promise<DiagramConfig> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      this.config = { ...DEFAULT_CONFIG, ...JSON.parse(content) };
      return this.config;
    } catch (error) {
      // 只有文件不存在时静默回退默认配置；JSON 损坏等错误必须抛出清晰错误
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return this.config;
      }
      throw new Error(
        `Failed to load config file ${this.configPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async save(): Promise<void> {
    await fs.writeFile(
      this.configPath,
      JSON.stringify(this.config, null, 2),
      'utf-8'
    );
  }

  getOutputPath(format: keyof DiagramConfig['defaultOutputPaths']): string {
    return this.config.defaultOutputPaths[format];
  }

  async setOutputPath(
    format: keyof DiagramConfig['defaultOutputPaths'],
    path: string
  ): Promise<void> {
    // 运行时防御非法 format key，避免把垃圾 key 写进配置文件
    if (!['drawio', 'mermaid', 'excalidraw'].includes(format)) {
      throw new Error(`Invalid format: ${format}. Expected one of: drawio, mermaid, excalidraw`);
    }
    this.config.defaultOutputPaths[format] = path;
    await this.save();
  }

  isInitialized(): boolean {
    return this.config.initialized;
  }

  async markInitialized(): Promise<void> {
    this.config.initialized = true;
    await this.save();
  }

  getConfig(): DiagramConfig {
    return { ...this.config };
  }

  async ensureDirectoriesExist(basePath: string): Promise<void> {
    for (const format of Object.keys(this.config.defaultOutputPaths)) {
      const dir = resolveConfiguredPath(
        basePath,
        this.config.defaultOutputPaths[format as keyof typeof DEFAULT_CONFIG.defaultOutputPaths]
      );
      await fs.mkdir(dir, { recursive: true });
    }
  }
}
