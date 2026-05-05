export const homeQuizListContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
}

export const homeQuizListItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}
