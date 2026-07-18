// 把 skills/diagram-generator/ 同步为 plugins/diagram-generator/skills/diagram-generator/
// skills/ 是唯一事实源；先清后拷，保证两边逐字节一致
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'skills/diagram-generator');
const target = path.join(root, 'plugins/diagram-generator/skills/diagram-generator');

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });

console.log(`Synced ${path.relative(root, source)} -> ${path.relative(root, target)}`);
