# Changelog

All notable changes to the mcp-diagram-generator MCP server will be documented in this file.

## [1.0.1] - 2025-02-03

### Added
- **Configuration Management System** (`src/config.ts`)
  - Default output paths: `diagrams/drawio/`, `diagrams/mermaid/`, `diagrams/excalidraw/`
  - Configuration file: `.diagram-config.json` in project root
  - Tools: `init_config`, `get_config`, `set_output_path`

- **Auto-directory Creation**
  - Output directories are created automatically when generating diagrams
  - No more "directory not found" errors
  - Recursive directory creation supported

- **New MCP Tools**
  - `init_config`: Initialize configuration with default or custom paths
  - `get_config`: View current configuration and paths
  - `set_output_path`: Update output path for specific format

- **Optional output_path Parameter**
  - `generate_diagram` now works without specifying `output_path`
  - Server uses configured default paths when not provided
  - Optional `filename` parameter for custom filenames with default directory

- **Auto-generated Filenames**
  - Filenames generated from diagram title + date
  - Format: `{title}-{YYYY-MM-DD}.{ext}`
  - Can be overridden with `filename` parameter

### Fixed
- **Duplicate ID Bug in Drawio Generation**
  - Changed root parent ID from `1` to `root-parent`
  - Fixed all child elements to reference correct parent
  - Edges now correctly reference `root-parent` instead of duplicate `1`
  - Files now load correctly in draw.io without "Duplicate ID" errors

### Changed
- **Server version bumped to 1.0.1**
- **Updated skill documentation** with new features and best practices
- **Enhanced tool descriptions** with configuration options
- **Improved error messages** for path-related issues

### Migration Guide

#### From v1.0.0 to v1.0.1

**Old usage (still supported):**
```json
{
  "diagram_spec": {...},
  "output_path": "diagrams/drawio/my-diagram.drawio"
}
```

**New usage (recommended):**
```json
{
  "diagram_spec": {...}
  // Automatically saves to diagrams/drawio/{title}-{date}.drawio
}
```

**Custom path configuration:**
```
First time:
  init_config({ paths: { drawio: "output/diagrams" } })

Subsequent calls:
  generate_diagram({ diagram_spec: {...} })
  // Uses configured path automatically
```

## [1.0.0] - 2025-02-01

### Initial Release
- Support for drawio, mermaid, and excalidraw formats
- JSON schema validation
- Network topology support with nested containers
- Flowchart, sequence diagram, class diagram, ER diagram support
- Style presets for different diagram types and devices
