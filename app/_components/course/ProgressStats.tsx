interface ProgressStatsProps {
  completed: number
  total: number
  percentage: number
  remaining?: number
}

export default function ProgressStats({
  completed,
  total,
  percentage,
  remaining,
}: ProgressStatsProps) {
  return (
    <div className="space-y-4">
      {/* 進捗バー */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">進捗</span>
          <span className="font-semibold text-gray-900 dark:text-gray-50">{percentage}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{completed}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">完了</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">総レッスン数</div>
        </div>
        {remaining !== undefined && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{remaining}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">残り</div>
          </div>
        )}
      </div>
    </div>
  )
}
