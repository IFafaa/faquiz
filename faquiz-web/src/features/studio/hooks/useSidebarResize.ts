import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

const SIDEBAR_W_MIN = 260
const SIDEBAR_W_DEFAULT = 320
const SIDEBAR_W_MAX_CAP = 720
const SIDEBAR_STORAGE_KEY = 'faquiz-builder-sidebar-w'

function getSidebarMaxWidth(): number {
  if (typeof window === 'undefined') return SIDEBAR_W_MAX_CAP
  return Math.min(SIDEBAR_W_MAX_CAP, Math.floor(window.innerWidth * 0.65))
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

export function useSidebarResize() {
  const [sidebarWidth, setSidebarWidth] = useState(readStoredSidebarWidth)
  const [isResizing, setIsResizing] = useState(false)
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  useEffect(() => {
    const onResize = () => setSidebarWidth((w) => clampSidebarWidth(w))
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
        } catch {}
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

  const onResizePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      dragRef.current = { startX: e.clientX, startWidth: sidebarWidth }
      setIsResizing(true)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [sidebarWidth],
  )

  return {
    sidebarWidth,
    isResizing,
    onResizePointerDown,
    SIDEBAR_W_MIN,
    sidebarMaxWidth: getSidebarMaxWidth(),
  }
}

export const SIDEBAR_CHEVRON_THRESHOLD = 360
