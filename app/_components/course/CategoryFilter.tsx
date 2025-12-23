'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Tables } from '@/lib/types/database.types'

interface CategoryFilterProps {
  categories: Tables<'categories'>[]
  selectedCategory?: string
}

export default function CategoryFilter({
  categories,
  selectedCategory,
}: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleCategoryChange = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams)

    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleCategoryChange(null)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          !selectedCategory
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        すべて
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
