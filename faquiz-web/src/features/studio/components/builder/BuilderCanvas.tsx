import '@xyflow/react/dist/style.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import {
  flowToSavePayload,
  getLayoutedElements,
  treeToFlow,
} from '@/features/studio/components/builder/flow-utils'
import { QuestionFlowNode } from '@/features/studio/components/builder/QuestionFlowNode'
import type { QuestionNodeData } from '@/features/studio/components/builder/types'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { BuilderSidebar } from './BuilderSidebar'

const nodeTypes = { question: QuestionFlowNode }

export function BuilderCanvas() {
  const { id: quizId = '' } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { fitView } = useReactFlow()

  const { data: quiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => faquizApi.getQuiz(quizId),
  })

  const { data: tree, isLoading } = useQuery({
    queryKey: ['quiz-tree', quizId],
    queryFn: () => faquizApi.getQuizTree(quizId),
  })

  const [rootNodeId, setRootNodeId] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<QuestionNodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    if (!tree) return
    const { nodes: n, edges: e } = treeToFlow(tree)
    startTransition(() => {
      setNodes(n)
      setEdges(e)
      setRootNodeId(tree.quiz.rootNodeId)
    })
  }, [tree, setNodes, setEdges])

  const selectedNode = useMemo(
    () => nodes.find((n) => n.selected) as Node<QuestionNodeData> | undefined,
    [nodes],
  )

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = flowToSavePayload(nodes, edges, rootNodeId)
      await faquizApi.saveQuizTree(quizId, body)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quiz-tree', quizId] })
      void queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
    },
  })

  const onConnect = useCallback(
    (c: Connection) => {
      if (!c.source || !c.target || !c.sourceHandle) return
      setEdges((eds) => {
        const next = eds.filter(
          (e) => !(e.source === c.source && e.sourceHandle === c.sourceHandle),
        )
        return addEdge(
          { ...c, id: `${c.sourceHandle}-${c.target}`, animated: true },
          next,
        )
      })
    },
    [setEdges],
  )

  const onLayout = useCallback(() => {
    if (nodes.length === 0) return
    const { nodes: laid } = getLayoutedElements(nodes, edges, 'LR')
    setNodes(laid)
    requestAnimationFrame(() => fitView({ padding: 0.2 }))
  }, [nodes, edges, setNodes, fitView])

  const addNode = useCallback(() => {
    const nid = crypto.randomUUID()
    const oid = crypto.randomUUID()
    setNodes((nds) => [
      ...nds,
      {
        id: nid,
        type: 'question',
        position: { x: 120 + nds.length * 24, y: 80 + nds.length * 24 },
        data: {
          title: 'Nova pergunta',
          description: '',
          questionType: 'multiple_choice',
          answerOptions: [
            { id: oid, label: 'Opção A', value: 'a', order: 0, nextQuestionNodeId: null },
          ],
        },
      },
    ])
  }, [setNodes])

  const updateSelectedData = useCallback(
    (data: QuestionNodeData) => {
      if (!selectedNode) return
      setNodes((nds) =>
        nds.map((n) => (n.id === selectedNode.id ? { ...n, data } : n)),
      )
    },
    [selectedNode, setNodes],
  )

  const addOption = useCallback(() => {
    if (!selectedNode) return
    const oid = crypto.randomUUID()
    const opts = [...selectedNode.data.answerOptions]
    const order = opts.length
    opts.push({
      id: oid,
      label: `Opção ${order + 1}`,
      value: String(order + 1),
      order,
      nextQuestionNodeId: null,
    })
    updateSelectedData({ ...selectedNode.data, answerOptions: opts })
  }, [selectedNode, updateSelectedData])

  const removeOption = useCallback(
    (optionId: string) => {
      if (!selectedNode) return
      const opts = selectedNode.data.answerOptions.filter((o) => o.id !== optionId)
      setEdges((eds) =>
        eds.filter(
          (e) =>
            !(e.source === selectedNode.id && e.sourceHandle === `opt-${optionId}`),
        ),
      )
      updateSelectedData({ ...selectedNode.data, answerOptions: opts })
    },
    [selectedNode, updateSelectedData, setEdges],
  )

  if (isLoading || !tree) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex min-h-[min(720px,calc(100vh-13rem))] flex-col gap-4 md:flex-row md:gap-0">
      <div className="relative min-h-[360px] min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} color="#27272a" />
          <Controls className="!bg-zinc-900 !border-zinc-700" />
          <MiniMap
            className="!bg-zinc-900 !border-zinc-700"
            maskColor="rgba(24,24,27,0.85)"
          />
          <Panel
            position="top-left"
            className="flex flex-wrap gap-2 rounded-lg bg-zinc-900/95 p-2 shadow-lg"
          >
            <Button size="sm" type="button" variant="secondary" onClick={addNode}>
              + Pergunta
            </Button>
            <Button size="sm" type="button" variant="secondary" onClick={onLayout}>
              Auto layout
            </Button>
            <Button
              size="sm"
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Salvando…' : 'Salvar árvore'}
            </Button>
          </Panel>
        </ReactFlow>
      </div>

      <BuilderSidebar
        quizTitle={quiz?.title}
        rootNodeId={rootNodeId}
        onRootNodeChange={setRootNodeId}
        nodes={nodes}
        selectedNode={selectedNode}
        onUpdateData={updateSelectedData}
        onAddOption={addOption}
        onRemoveOption={removeOption}
      />
    </div>
  )
}
