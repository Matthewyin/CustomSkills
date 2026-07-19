# Network Topology Playbook

Use this playbook for datacenters, network zones, routers, switches, firewalls, load balancers, SSL gateways, proxies, clouds, and cross-site links.

## Default Choice

Default format/direction: see the dispatch table in SKILL.md.

- Best use: Word documents, engineering documentation, editable topology diagrams.
- Excalidraw is acceptable only when the user explicitly wants a whiteboard or hand-drawn version.
- Mermaid is not recommended for complex topology because nested containers and device styling are limited.

## Intake Defaults

When the user selects automatic choices:
- Use Draw.io for complex topology.
- Use vertical layout for Word or documentation.
- Use horizontal layout only when the user explicitly optimizes for PPT.
- Keep edge labels off by default.

## Required Hierarchy

Prefer this hierarchy:

```text
Environment
  Datacenter
    Zone
      Device
```

Use container `level` values:
- Environment: `level: "environment"`
- Datacenter: `level: "datacenter"`
- Zone: `level: "zone"`

Put devices inside the smallest correct zone. Do not flatten devices into the top-level `elements` list unless there is no meaningful container.

## Container Semantics

Keep logically separate domains in separate containers:
- Province center and bank belong to separate containers.
- Private cloud belongs inside the related datacenter, not outside the datacenter.
- Peer datacenters can sit side by side.
- Inside a datacenter, peer access or inline zones can sit side by side.
- Core zones sit below access or inline zones.
- Private cloud zones sit below core zones.

## Draw.io Rules

- Use explicit `geometry` for all complex topology diagrams.
- Top-level coordinates are absolute.
- Child coordinates are relative to the direct parent container.
- Keep containers compact, but preserve readable spacing between device boxes.
- Avoid large empty bands.
- Use 20px default font size.
- Make node boxes large enough for text wrapping.
- Network topology connectors must be straight lines without orthogonal turns.
- Do not put text on topology connectors by default.
- Use top-level edges only.

## Device Type Presets

Use `deviceType` instead of relying only on the node name:

| Device | `deviceType` |
| --- | --- |
| Router | `router` |
| Access switch | `accessSwitch` |
| General switch | `switch` |
| Core switch | `coreSwitch` |
| Firewall | `firewall` |
| Load balancer or F5 | `loadBalancer` |
| SSL gateway | `sslGateway` |
| Nginx or proxy server | `proxy` |
| Cloud | `cloud` |
| External system | `externalSystem` |

If the prompt contains an unknown device type such as DWDM, keep the device name and use the default device style instead of failing.

## Generator Heuristics (Draw.io Layout)

The Draw.io generator applies these layout rules automatically. Explicit fields take precedence where noted.

### Zone Device Columns

Inside a `zone` container, nodes are grouped into columns 0-6. An explicit `deviceType` is mapped first; otherwise the generator falls back to a case-insensitive substring match on the node's `id` and `name`:

| Column | `deviceType` Mapping | Name/`id` Keyword Fallback |
| --- | --- | --- |
| 0 | `router`, `externalSystem` | `router`, `路由`, `省中心`, `银行` |
| 1 | `accessSwitch` | `access`, `接入交换机` |
| 2 | `firewall` | `fw`, `firewall`, `防火墙` |
| 3 (default) | `switch`, `gateway`, `service`, `server` | `dmz`, `汇聚`, `dwdm`, `otn`, `sdh`, `传输` |
| 4 | `loadBalancer`, `sslGateway`, `proxy`, `database`, `cache`, `messageQueue` | `f5`, `ssl`, `nginx`, `代理` |
| 5 | `coreSwitch` | `core`, `核心` |
| 6 | `cloud` | `cloud`, `专有云` |

Nodes without any match land in column 3. Within a column, nodes flow two per row.

### Datacenter Zone Ordering

Inside a `datacenter` container, zones whose `name` contains `核心` or `专有云` are pulled out of the normal two-per-row grid and placed centered below all other zones: `核心` first, then `专有云`.

### Environment Children

Inside an `environment` container, children with `level: "other"` are treated as external systems and placed in the top row; datacenters and remaining containers flow two per row below.

### Edge Label Deduplication

Topology edges are straight and label-free by default (see Draw.io Rules). Even when labels are enabled, identical label texts are rendered only once per diagram.

How to avoid surprises:
- Always set `deviceType` instead of relying on name keywords.
- Avoid `核心`/`专有云` in zone names unless the zone really is the core or private-cloud zone.
- Provide explicit `geometry` when the automatic placement does not match the intended reading order; explicit positions always win.

## Required Colors And Shapes

Use these expectations when the generator supports them:
- Router: blue ellipse.
- Switch, access switch, and core switch: `#FFFFCC`.
- Firewall: red diamond or hexagon depending on format support.
- Load balancer: purple.
- SSL gateway: cyan.
- Proxy: blue.
- Cloud or private cloud: cloud or ellipse style.
- Unknown device: default device shape and color.

## Excalidraw Topology Rules

Use Excalidraw only for whiteboard-style topology:
- Keep container backgrounds transparent.
- Bind and group node labels with node shapes.
- Bind and group container labels with container shapes.
- Bind connectors to element edges, not centers.
- Place edge labels away from connector lines.
- Use explicit geometry for complex topologies.

## Quality Gate

Before generation:
- Confirm the selected format, direction, and usage context.
- Verify environment -> datacenter -> zone -> device nesting.
- Verify private cloud placement inside datacenter containers.
- Verify province center and bank are not in the same container.
- Verify all edge endpoints resolve to existing nodes.
- Verify edge labels are omitted unless the user explicitly requested them.
- Verify straight-line topology connector rules for Draw.io.

After generation:
- Check that no topology edge labels appear unexpectedly.
- Check that switch fill color is `#FFFFCC`.
- Check that connector routing is straight for Draw.io topology.
- For Excalidraw, check that arrows have `startBinding` and `endBinding`.
