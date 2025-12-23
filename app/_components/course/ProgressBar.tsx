interface ProgressBarProps {
  completed: number
  total: number
  percentage: number
}

export default function ProgressBar({
  completed,
  total,
  percentage,
}: ProgressBarProps) {
  return (
    <div className="space-y-2">
      {/* Progress text */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {completed}/{total}レッスン完了
        </span>
        <span className="font-semibold text-gray-900 dark:text-gray-50">
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
