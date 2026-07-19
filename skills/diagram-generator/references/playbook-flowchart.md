# Flowchart Playbook

Use this playbook for process flows, approval flows, decision trees, retry flows, error handling, and operational procedures.

## Default Choice

Default format/direction: see the dispatch table in SKILL.md.

- Use Draw.io for complex multi-branch layouts that need manual placement.
- Use Excalidraw only for informal whiteboard process sketches.

## Mermaid Rules

- Use `diagramType: "flowchart"`.
- Use `flowchart TD` for vertical flow.
- Use rounded nodes for start and end.
- Use diamond nodes for decisions.
- Decision edges must have clear labels such as `yes/no`, `approved/rejected`, or `success/failure`.
- Keep the main path vertical.
- Place exception, retry, rejected, or fallback paths as side branches.
- Keep node labels short.
- Put long explanations outside the diagram.

## Draw.io Rules

Use Draw.io when the process is too complex for Mermaid:
- Main path flows top to bottom.
- Side branches go left or right.
- Retry, return, reject, and fallback edges should not push the main flow downward.
- Decision nodes use diamond shape.
- Start and end nodes use rounded shape.
- Decision branches must have labels.

## Excalidraw Rules

Use Excalidraw for whiteboard process diagrams:
- Use explicit geometry for more than a few nodes.
- Bind and group text with shapes.
- Bind connectors to element edges.
- Put edge labels away from connector lines.

## Generator Heuristics: Keyword-Based Shapes

The Mermaid and Draw.io generators share one keyword table. When a node has no explicit `shape`, its shape is inferred from a case-insensitive substring match against the node's `id` and `name` combined:

| Keyword in node `id`/`name` | Inferred Shape |
| --- | --- |
| `start`, `开始`, `发起` | rounded (start/end) |
| `end`, `结束`, `完成`, `终止` | rounded (start/end) |
| `?`, `是否`, `判断`, `审批`, `审核`, `校验`, `验证`, `通过` | diamond (decision) |

Rules:
- An explicit `shape` field always wins over keyword inference.
- Start/end keywords are checked before decision keywords.
- Matching also covers the node `id` and is substring-based: an id like `restart` matches `start`, and a name like `已完成` matches `完成`.

Draw.io layout also treats edge labels containing `退回`, `返回`, `驳回`, `重试`, or `重新` as backward edges: they are excluded from rank calculation so they do not push the main flow downward.

How to avoid surprises:
- Set `shape` explicitly when a node name contains a trigger word but needs another shape.
- Keep trigger words out of node `id`s unless you also set an explicit `shape`.

## Quality Gate

Before generation:
- Identify start and end nodes.
- Identify decisions and required branch labels.
- Identify the main success path.
- Identify side branches and loops.
- Confirm whether the output is documentation-grade or whiteboard-grade.

After generation:
- Check that decision nodes have at least two outgoing edges.
- Check that decision outgoing edges have labels.
- Check that the main path remains readable.
