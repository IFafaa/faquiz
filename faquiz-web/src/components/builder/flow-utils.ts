import dagre from 'dagre'
import type { Edge, Node } from '@xyflow/react'
import type { QuizTreeSnapshot } from '@/types/api'
import type { QuestionNodeData } from './types'

const NODE_W = 260
const NODE_H = 160

export function treeToFlow(snapshot: QuizTreeSnapshot): {
  nodes: Node<QuestionNodeData>[]
  edges: Edge[]
} {
  const nodes: Node<QuestionNodeData>[] = snapshot.nodes.map((n) => ({
    id: n.id,
    type: 'question',
    position: { x: n.positionX, y: n.positionY },
    data: {
      title: n.title,
      description: n.description,
      questionType: n.questionType,
      answerOptions: n.answerOptions.map((o) => ({
        id: o.id,
        label: o.label,
        value: o.value,
        order: o.order,
        nextQuestionNodeId: o.nextQuestionNodeId,
      })),
    },
  }))

  const edges: Edge[] = []
  for (const n of snapshot.nodes) {
    for (const opt of n.answerOptions) {
      if (opt.nextQuestionNodeId) {
        edges.push({
          id: `e-${opt.id}-${opt.nextQuestionNodeId}`,
          source: n.id,
          target: opt.nextQuestionNodeId,
          sourceHandle: `opt-${opt.id}`,
        })
      }
    }
  }
  return { nodes, edges }
}

export function flowToSavePayload(
  nodes: Node<QuestionNodeData>[],
  edges: Edge[],
  rootNodeId: string | null,
): {
  rootNodeId: string | null
  nodes: Array<{
    id: string
    title: string
    description: string
    questionType: QuestionNodeData['questionType']
    positionX: number
    positionY: number
    answerOptions: Array<{
      id: string
      label: string
      value: string
      order: number
      nextQuestionNodeId: string | null
    }>
  }>
} {
  const payloadNodes = nodes.map((n) => {
    const opts = (n.data.answerOptions ?? []).map((opt) => {
      const edge = edges.find(
        (e) =>
          e.source === n.id &&
          e.sourceHandle === `opt-${opt.id}`,
      )
      return {
        id: opt.id,
        label: opt.label,
        value: opt.value,
        order: opt.order,
        nextQuestionNodeId: edge?.target ?? null,
      }
    })
    return {
      id: n.id,
      title: n.data.title,
      description: n.data.description ?? '',
      questionType: n.data.questionType,
      positionX: n.position.x,
      positionY: n.position.y,
      answerOptions: opts,
    }
  })
  return { rootNodeId, nodes: payloadNodes }
}

export function getLayoutedElements(
  nodes: Node<QuestionNodeData>[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR',
): { nodes: Node<QuestionNodeData>[]; edges: Edge[] } {
  if (nodes.length === 0) {
    return { nodes: [], edges }
  }
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    ranksep: 80,
    nodesep: 40,
  })

  nodes.forEach((n) => {
    g.setNode(n.id, { width: NODE_W, height: NODE_H })
  })
  edges.forEach((e) => {
    g.setEdge(e.source, e.target)
  })
  dagre.layout(g)

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id)
    if (!pos) return node
    return {
      ...node,
      position: {
        x: pos.x - NODE_W / 2,
        y: pos.y - NODE_H / 2,
      },
    }
  })
  return { nodes: layoutedNodes, edges }
}
