// flowchart 关键词分类器：drawio 与 mermaid 生成器共用，保持中英文关键词表一致

export function includesAny(text: string, values: string[]): boolean {
  return values.some(value => text.includes(value));
}

function nodeText(node: { id: string; name: string }): string {
  return `${node.id} ${node.name}`.toLowerCase();
}

export function isFlowchartStartNode(node: { id: string; name: string }): boolean {
  return includesAny(nodeText(node), ['start', '开始', '发起']);
}

export function isFlowchartEndNode(node: { id: string; name: string }): boolean {
  return includesAny(nodeText(node), ['end', '结束', '完成', '终止']);
}

export function isFlowchartDecisionNode(node: { id: string; name: string }): boolean {
  return includesAny(nodeText(node), ['?', '是否', '判断', '审批', '审核', '校验', '验证', '通过']);
}

export function isFlowchartBackwardEdge(label?: string): boolean {
  return includesAny(label || '', ['退回', '返回', '驳回', '重试', '重新']);
}
