// 跨平台清理 dist，替代 rm -rf
import fs from 'fs';

fs.rmSync('dist', { recursive: true, force: true });
