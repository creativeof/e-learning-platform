import Image from 'next/image'
import Link from 'next/link'
import { Tables } from '@/lib/types/database.types'

type Course = Tables<'courses'> & {
  category: Tables<'categories'> | null
  course_tags: Array<{ tag: Tables<'tags'> | null }>
}

interface CourseCardProps {
  course: Course
  priority?: boolean
}

export default function CourseCard({ course, priority = false }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group block rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-900"
      prefetch={true}
    >
      {/* サムネイル */}
      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
            画像なし
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="p-4">
        {/* カテゴリバッジ */}
        {course.category && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {course.category.name}
            </span>
          </div>
        )}

        {/* タイトル */}
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {course.title}
        </h3>

        {/* 説明文 */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {course.description}
        </p>

        {/* タグ */}
        {course.course_tags && course.course_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.course_tags.map((ct, index) => (
              ct.tag && (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {ct.tag.name}
                </span>
              )
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
