import * as fs from 'fs/promises';
import * as path from 'path';
import { DiagramFormat } from '../types.js';

interface ResolveDiagramOutputPathArgs {
  projectRoot: string;
  defaultDir: string;
  format: DiagramFormat;
  outputPath?: string;
  filename: string;
}

export async function resolveDiagramOutputPath({
  projectRoot,
  defaultDir,
  format,
  outputPath,
  filename
}: ResolveDiagramOutputPathArgs): Promise<string> {
  const normalizedFilename = ensureFilenameExtension(filename, format);

  if (!outputPath) {
    return path.join(projectRoot, defaultDir, normalizedFilename);
  }

  const resolvedPath = path.isAbsolute(outputPath)
    ? outputPath
    : path.join(projectRoot, outputPath);

  if (await isDirectoryLikePath(resolvedPath, outputPath, format)) {
    return path.join(resolvedPath, normalizedFilename);
  }

  return resolvedPath;
}

async function isDirectoryLikePath(
  resolvedPath: string,
  originalPath: string,
  format: DiagramFormat
): Promise<boolean> {
  try {
    const stat = await fs.stat(resolvedPath);
    if (stat.isDirectory()) {
      return true;
    }
  } catch {
    // 路径不存在时，继续按字符串形态判断。
  }

  if (originalPath.endsWith(path.sep) || originalPath.endsWith('/')) {
    return true;
  }

  return !hasDiagramExtension(resolvedPath, format);
}

function ensureFilenameExtension(filename: string, format: DiagramFormat): string {
  if (hasDiagramExtension(filename, format)) {
    return filename;
  }

  return `${filename}.${getDefaultExtension(format)}`;
}

function hasDiagramExtension(filePath: string, format: DiagramFormat): boolean {
  const extension = path.extname(filePath).toLowerCase();
  const validExtensions = format === 'drawio' ? ['.drawio'] :
                          format === 'mermaid' ? ['.mmd', '.md'] :
                          format === 'excalidraw' ? ['.excalidraw'] : [];

  return validExtensions.includes(extension);
}

function getDefaultExtension(format: DiagramFormat): string {
  return format === 'drawio' ? 'drawio' :
         format === 'mermaid' ? 'md' :
         format === 'excalidraw' ? 'excalidraw' : 'txt';
}
