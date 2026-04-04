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
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import clsx from 'clsx'
import { useParams } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { BuilderInspector } from '@/features/admin/components/builder/BuilderInspector'
import { flowToSavePayload, getLayoutedElements, treeToFlow } from '@/features/admin/components/builder/flow-utils'
import { QuestionFlowNode } from '@/features/admin/components/builder/QuestionFlowNode'
import type { QuestionNodeData } from '@/features/admin/components/builder/types'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'

const nodeTypes = { question: QuestionFlowNode }

const SIDEBAR_W_MIN = 260
const SIDEBAR_W_DEFAULT = 320
const SIDEBAR_W_MAX_CAP = 720
const SIDEBAR_STORAGE_KEY = 'faquiz-builder-sidebar-w'
const SIDEBAR_CHEVRON_THRESHOLD = 360

function getSidebarMaxWidth(): number {
  if (typeof window === 'undefined') return SIDEBAR_W_MAX_CAP
  return Math.min(
    SIDEBAR_W_MAX_CAP,
    Math.floor(window.innerWidth * 0.65),
  )
}

function clampSidebarWidth(w: number): number {
  return Math.min(Math.max(w, SIDEBAR_W_MIN), getSidebarMaxWidth())
}

function readStoredSidebarWidth(): number {
  if (typeof window === 'undefined') return SIDEBAR_W_DEFAULT
  const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY)
  const n = raw ? parseInt(raw, 10) : NaN
  if (!Number.isFinite(n)) return SIDEBAR_W_DEFAULT
  return clampSidebarWidth(n)
}

function useMinWidthMd() {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const apply = () => setMatches(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return matches
}

function BuilderCanvas() {
  const { id: quizId = '' } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { fitView } = useReactFlow()
  const isMd = useMinWidthMd()

  const [sidebarWidth, setSidebarWidth] = useState(readStoredSidebarWidth)
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)
  const [isResizing, setIsResizing] = useState(false)

  const { data: quiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => faquizApi.getQuiz(quizId),
  })

  const { data: tree, isLoading } = useQuery({
    queryKey: ['quiz-tree', quizId],
    queryFn: () => faquizApi.getQuizTree(quizId),
  })

  const [rootNodeId, setRootNodeId] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<QuestionNodeData>
  >([])
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

  useEffect(() => {
    const onResize = () => {
      setSidebarWidth((w) => clampSidebarWidth(w))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!isResizing) return
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return
      const delta = dragRef.current.startX - e.clientX
      const next = dragRef.current.startWidth + delta
      setSidebarWidth(clampSidebarWidth(next))
    }
    const onUp = () => {
      dragRef.current = null
      setIsResizing(false)
      setSidebarWidth((w) => {
        const clamped = clampSidebarWidth(w)
        try {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(clamped))
        } catch {
          // no-op
        }
        return clamped
      })
      document.body.style.removeProperty('cursor')
      document.body.style.removeProperty('user-select')
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [isResizing])

  const onResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMd || e.button !== 0) return
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startWidth: sidebarWidth }
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

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

  const sidebarExpanded = sidebarWidth > SIDEBAR_CHEVRON_THRESHOLD

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

      <div className="flex w-full flex-col md:w-auto md:flex-row md:items-stretch">
        <div
          role="separator"
          aria-orientation="vertical"
          aria-valuemin={SIDEBAR_W_MIN}
          aria-valuemax={getSidebarMaxWidth()}
          aria-valuenow={Math.round(sidebarWidth)}
          aria-label="Redimensionar painel lateral"
          onPointerDown={onResizePointerDown}
          className={clsx(
            'group hidden w-3 shrink-0 cursor-col-resize touch-none select-none flex-col items-center justify-center rounded-l border border-r-0 border-zinc-700/80 bg-zinc-900/90 hover:bg-zinc-800 md:flex',
            isResizing && 'bg-brand-900/40',
          )}
        >
          <span
            className="pointer-events-none text-zinc-500 group-hover:text-zinc-300"
            aria-hidden
          >
            {sidebarExpanded ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </span>
        </div>

        <Card
          className="w-full min-w-0 shrink-0 space-y-4 overflow-hidden p-4 md:rounded-l-none md:border-l-0"
          style={isMd ? { width: sidebarWidth } : undefined}
        >
          <div>
            <p className="text-xs text-zinc-500">Quiz</p>
            <p className="font-medium text-zinc-200">{quiz?.title}</p>
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
                key={selectedNode.id}
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
    </div>
  )
}

export function QuizBuilderPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-zinc-100">
          Fluxo de perguntas
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Arraste conexões entre perguntas, defina a raiz e salve. As abas no topo
          levam às outras áreas do quiz.
        </p>
      </div>
      <ReactFlowProvider key={id}>
        <BuilderCanvas />
      </ReactFlowProvider>
    </div>
  )
}
