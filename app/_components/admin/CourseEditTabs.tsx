'use client'

import { useState } from 'react'
import CourseForm from './CourseForm'
import CurriculumEditor from './CurriculumEditor'

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  category_id: string | null
}

interface Lesson {
  id: string
  title: string
  description: string | null
  youtube_video_id: string
  order: number
}

interface Section {
  id: string
  title: string
  description: string | null
  order: number
  lessons: Lesson[]
}

interface CourseEditTabsProps {
  course: Course
  categories: Category[]
  tags: Tag[]
  selectedTagIds: string[]
  sections: Section[]
}

type Tab = 'basic' | 'curriculum'

export default function CourseEditTabs({
  course,
  categories,
  tags,
  selectedTagIds,
  sections,
}: CourseEditTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('basic')

  return (
    <div>
      {/* タブヘッダー */}
      <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            基本情報
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'curriculum'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            カリキュラム
          </button>
        </nav>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'basic' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <CourseForm
            categories={categories}
            tags={tags}
            course={course}
            selectedTagIds={selectedTagIds}
          />
        </div>
      )}

      {activeTab === 'curriculum' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <CurriculumEditor courseId={course.id} sections={sections} />
        </div>
      )}
    </div>
  )
}
