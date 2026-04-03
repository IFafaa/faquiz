import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getQuiz, getQuizTree, saveQuizTree } from '@/api/quiz'
import { BuilderInspector } from '@/components/builder/BuilderInspector'
import { flowToSavePayload, getLayoutedElements, treeToFlow } from '@/components/builder/flow-utils'
import { QuestionFlowNode } from '@/components/builder/QuestionFlowNode'
import type { QuestionNodeData } from '@/components/builder/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

const nodeTypes = { question: QuestionFlowNode }

function BuilderCanvas() {
  const { id: quizId = '' } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { fitView } = useReactFlow()

  const { data: quiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuiz(quizId),
  })

  const { data: tree, isLoading } = useQuery({
    queryKey: ['quiz-tree', quizId],
    queryFn: () => getQuizTree(quizId),
  })

  const [rootNodeId, setRootNodeId] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<QuestionNodeData>
  >([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    if (!tree) return
    const { nodes: n, edges: e } = treeToFlow(tree)
    /* Hidrata nós/arestas do snapshot; React Flow exige estado local. */
    /* eslint-disable react-hooks/set-state-in-effect */
    setNodes(n)
    setEdges(e)
    setRootNodeId(tree.quiz.rootNodeId)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [tree, setNodes, setEdges])

  const selectedNode = useMemo(
    () => nodes.find((n) => n.selected) as Node<QuestionNodeData> | undefined,
    [nodes],
  )

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = flowToSavePayload(nodes, edges, rootNodeId)
      await saveQuizTree(quizId, body)
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
          (e) =>
            !(
              e.source === c.source &&
              e.sourceHandle === c.sourceHandle
            ),
        )
        return addEdge(
          {
            ...c,
            id: `${c.sourceHandle}-${c.target}`,
            animated: true,
          },
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
            {
              id: oid,
              label: 'Opção A',
              value: 'a',
              order: 0,
              nextQuestionNodeId: null,
            },
          ],
        },
      },
    ])
  }, [setNodes])

  const updateSelectedData = useCallback(
    (data: QuestionNodeData) => {
      if (!selectedNode) return
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id ? { ...n, data } : n,
        ),
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
            !(
              e.source === selectedNode.id &&
              e.sourceHandle === `opt-${optionId}`
            ),
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
    <div className="flex h-[calc(100vh-8rem)] min-h-[480px] flex-col gap-4 md:flex-row">
      <div className="relative min-h-[360px] flex-1 rounded-xl border border-zinc-800 bg-zinc-950">
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

      <Card className="w-full shrink-0 space-y-4 p-4 md:w-80">
        <div>
          <p className="text-xs text-zinc-500">Quiz</p>
          <p className="font-medium text-zinc-200">{quiz?.title}</p>
          <Link
            to={`/admin/quizzes/${quizId}/settings`}
            className="mt-1 inline-block text-xs text-brand-300 hover:underline"
          >
            Configurações e QR
          </Link>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Nó raiz (início do quiz)
          </label>
          <select
            value={rootNodeId ?? ''}
            onChange={(e) =>
              setRootNodeId(e.target.value || null)
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="">— selecione —</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {(n.data as QuestionNodeData).title || n.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
        <div className="border-t border-zinc-800 pt-4">
          <p className="mb-2 text-xs font-semibold text-zinc-400">Inspetor</p>
          {selectedNode ? (
            <BuilderInspector
              data={selectedNode.data}
              onChange={updateSelectedData}
              onAddOption={addOption}
              onRemoveOption={removeOption}
            />
          ) : (
            <p className="text-xs text-zinc-500">
              Selecione um nó para editar. Arraste das saídas (à direita) até
              outro nó para definir o fluxo.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

export function QuizBuilderPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-bold text-zinc-50">
          Builder
        </h1>
        <Link
          to="/admin/quizzes"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Voltar à lista
        </Link>
      </div>
      <ReactFlowProvider key={id}>
        <BuilderCanvas />
      </ReactFlowProvider>
    </div>
  )
}
