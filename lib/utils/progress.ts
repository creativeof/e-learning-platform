export function calculateProgress(
  totalLessons: number,
  completedLessons: number
): {
  completed: number
  total: number
  percentage: number
  remaining: number
} {
  const percentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const remaining = totalLessons - completedLessons

  return {
    completed: completedLessons,
    total: totalLessons,
    percentage,
    remaining: Math.max(0, remaining),
  }
}
