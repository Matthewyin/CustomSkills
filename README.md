# CustomSkills

This repository contains reusable Codex skills, MCP servers, and plugin packages.

## Diagram Generator

`diagram-generator` is split into three publishable surfaces:

- `skills/diagram-generator/`: the agent-facing skill and reference playbooks.
- `mcp-diagram-generator/`: the TypeScript MCP server that generates Draw.io, Mermaid, and Excalidraw files.
- `plugins/diagram-generator/`: the Codex plugin wrapper that installs the skill and configures the MCP server.

The plugin MCP configuration uses:

```json
{
  "mcpServers": {
    "mcp-diagram-generator": {
      "command": "npx",
      "args": ["-y", "mcp-diagram-generator"]
    }
  }
}
```

This intentionally resolves the latest npm package at runtime.

## Subtitle Converter

`subtitle-converter` is a standalone skill for subtitle format conversion.

- Converts between VTT, SRT, ASS, and LRC.
- Supports timeline offset.
- Supports bilingual subtitle merging.
- Uses only the Python standard library.

## Repository Layout

```text
CustomSkills/
├── mcp-diagram-generator/
│   ├── scripts/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── plugins/
│   └── diagram-generator/
│       ├── .codex-plugin/
│       ├── .mcp.json
│       └── skills/
└── skills/
    ├── diagram-generator/
    │   ├── SKILL.md
    │   ├── package.json
    │   └── references/
    └── subtitle-converter/
        ├── SKILL.md
        ├── scripts/
        └── references/
```

## Local Checks

Run subtitle converter syntax checks:

```bash
python3 -m py_compile skills/subtitle-converter/scripts/convert.py
```

Run MCP server checks from `mcp-diagram-generator/`:

```bash
npm install
npm run build
npm run test:diagrams
```

Generated artifacts, local runtime state, dependency folders, archives, and environment files are intentionally ignored.

## License

MIT
