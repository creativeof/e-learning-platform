interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-50">{value}</p>
        </div>
        <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      </div>
    </div>
  )
}
