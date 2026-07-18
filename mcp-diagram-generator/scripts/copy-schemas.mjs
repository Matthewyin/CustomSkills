// 跨平台拷贝 schema，dist 已先清理，保证 dist/schemas 单层结构
import fs from 'fs';

fs.cpSync('src/schemas', 'dist/schemas', { recursive: true });
