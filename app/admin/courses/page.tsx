import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import DeleteCourseButton from '@/app/_components/admin/DeleteCourseButton'

export const metadata: Metadata = {
  title: '講座管理',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminCoursesPage() {
  await requireAdmin()

  const supabase = await createClient()

  // 講座データを取得
  const { data: courses } = await supabase
    .from('courses')
    .select(
      `
      *,
      category:categories(name),
      sections(count)
    `
    )
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">講座管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            講座の作成・編集・削除を行います
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          新規講座作成
        </Link>
      </div>

      {/* 講座一覧テーブル */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        {!courses || courses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              まだ講座がありません
            </p>
            <Link
              href="/admin/courses/new"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              最初の講座を作成する
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    講座
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    カテゴリ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    セクション数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    作成日
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {courses.map((course: any) => (
                  <tr
                    key={course.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {course.thumbnail_url && (
                          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <Image
                              src={course.thumbnail_url}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-50">
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {course.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                        {course.category?.name || '未設定'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-50">
                      {course.sections?.[0]?.count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(course.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-50 rounded-lg transition-colors"
                        >
                          編集
                        </Link>
                        <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
