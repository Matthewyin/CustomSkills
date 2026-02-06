import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

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
      // Config file doesn't exist, return defaults
      return this.config;
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
      const dir = path.join(
        basePath,
        this.config.defaultOutputPaths[format as keyof typeof DEFAULT_CONFIG.defaultOutputPaths]
      );
      await fs.mkdir(dir, { recursive: true });
    }
  }
}
