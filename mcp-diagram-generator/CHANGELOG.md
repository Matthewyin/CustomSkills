# Changelog

All notable changes to the mcp-diagram-generator MCP server will be documented in this file.

## [1.2.0] - 2026-07-18

### Fixed
- **Build**: `npm run build` is now repeatable and cross-platform (Node scripts replace `rm -rf`/`cp -r`); `dist/schemas/diagram-spec.schema.json` no longer nests into `dist/schemas/schemas/` on rebuild, so the runtime validator always reads the current schema.
- **Publish**: added `prepublishOnly` (build + regression tests); `manual-run*` files are excluded from the npm package.
- **Validation**: the JSON Schema is now the structural source of truth via ajv (required fields, id pattern, enums, color formats); schema load failures raise a clear error instead of crashing at startup. Hand-written checks remain for semantics: edge source/target resolution, container nesting depth, flowchart decision rules, and recursive ID uniqueness.
- **Schema drift**: color fields accept `"none"` (drawio no-fill); `endArrow`/`startArrow` support `"block"`; id pattern is enforced.
- **Support matrix validation**: specs with `layers`/`lanes` and a non-drawio format now fail validation with a clear error; drawio architecture/swimlane mode rejects top-level non-edge elements that would be silently dropped; mermaid sequence/class/ER specs containing containers are rejected.
- **Config**: absolute configured paths are no longer wrongly joined onto the project root; `config.load()` only stays silent when the file is missing and throws a clear error on corrupted JSON; `set_output_path` validates the `format` enum before writing.
- **Server**: MCP server version is read from `package.json` instead of a hardcoded string; unknown tools now throw `MethodNotFound` instead of returning a text error.
- **Mermaid**: default file extension is `.mmd`; edge labels are escaped through `formatLabel` so quotes no longer break the syntax.
- **Draw.io**: user-provided style attribute values are XML-escaped.
- **Layout**: explicit `(0, 0)` geometry is now respected (previously treated as "unspecified").
- **Generators**: each generator deep-clones the incoming spec (`structuredClone`), so layout normalization no longer mutates the caller's object.

### Changed (internal quality, no behavior change; generated output is byte-identical)
- **Testing**: regression suite migrated to vitest (`tests/`, 42 cases incl. negative validation cases) running directly against `src`; `scripts/test-diagrams.mjs` remains as the dist smoke test. `npm test` runs the unit suite; `prepublishOnly` runs build + both suites.
- **Shared generator utilities**: flowchart keyword classifiers and geometry helpers (explicit-position marking, geometry ensure/read, container expansion) deduplicated into `src/generators/shared/`, parameterized by each generator's own constants.
- **Per-run render context**: Draw.io and Excalidraw generation state now lives on a fresh render-context object created per `generate()` call instead of mutable fields on the long-lived generator instance, eliminating cross-call state leakage.
- **Types**: `ExcalidrawElement` interface completed (`boundElements`, `textAlign`, `verticalAlign`, `lastCommittedPoint`, `containerId: string`, `roundness`); all `as any` casts removed from `src/`.

## [1.1.0] - 2026-02-06

### Added
- Explicit `diagramType` field (`flowchart`, `sequence`, `class`, `er`, `architecture`, `swimlane`).
- Architecture diagrams via `layers`; swimlane diagrams via `lanes` (Draw.io).
- Flowchart defaults: rounded start/end nodes, diamond decision nodes, labeled decision edges.
- `resolveDiagramOutputPath` output-path resolution module and regression test suite (`scripts/test-diagrams.mjs`).
- Skill restructured into a concise dispatcher with reference playbooks.

### Note
- Versions 1.1.1–1.1.4 were npm patch releases without individually documented changes; 1.1.4 was the last published version before 1.2.0.

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
