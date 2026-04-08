import { ReactFlowProvider } from '@xyflow/react'
import { useParams } from 'react-router-dom'
import { BuilderCanvas } from '@/features/studio/components/builder/BuilderCanvas'

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
