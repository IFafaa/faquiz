/** Formata ISO UTC para data/hora curta em pt-BR (fuso do browser). */
export function formatDateTimePtBr(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}
