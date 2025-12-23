'use client'

import {
  deleteSection,
  moveSectionUp,
  moveSectionDown,
} from '@/app/actions/admin/sections'
import {
  deleteLesson,
  moveLessonUp,
  moveLessonDown,
} from '@/app/actions/admin/lessons'
import SectionForm from './SectionForm'
import LessonForm from './LessonForm'
import { useState, useTransition } from 'react'

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

interface CurriculumEditorProps {
  courseId: string
  sections: Section[]
}

export default function CurriculumEditor({
  courseId,
  sections,
}: CurriculumEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [addingSectionId, setAddingSectionId] = useState<string | null>(null)
  const [showNewSectionForm, setShowNewSectionForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleDeleteSection = (sectionId: string, sectionTitle: string) => {
    if (
      !confirm(
        `「${sectionTitle}」を削除しますか？\nセクション内のすべてのレッスンも削除されます。`
      )
    )
      return

    startTransition(async () => {
      await deleteSection(sectionId)
    })
  }

  const handleDeleteLesson = (lessonId: string, lessonTitle: string) => {
    if (!confirm(`「${lessonTitle}」を削除しますか？`)) return

    startTransition(async () => {
      await deleteLesson(lessonId)
    })
  }

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    setError(null)
    startTransition(async () => {
      try {
        const result = direction === 'up'
          ? await moveSectionUp(sectionId)
          : await moveSectionDown(sectionId)

        if (!result.success) {
          setError('これ以上移動できません')
        }
      } catch (err) {
        console.error('Move section error:', err)
        setError(err instanceof Error ? err.message : 'セクションの移動に失敗しました')
      }
    })
  }

  const handleMoveLesson = (lessonId: string, direction: 'up' | 'down') => {
    setError(null)
    startTransition(async () => {
      try {
        const result = direction === 'up'
          ? await moveLessonUp(lessonId)
          : await moveLessonDown(lessonId)

        if (!result.success) {
          setError('これ以上移動できません')
        }
      } catch (err) {
        console.error('Move lesson error:', err)
        setError(err instanceof Error ? err.message : 'レッスンの移動に失敗しました')
      }
    })
  }

  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 新規セクション追加ボタン */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          カリキュラム
        </h3>
        {!showNewSectionForm && (
          <button
            onClick={() => setShowNewSectionForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            新規セクション追加
          </button>
        )}
      </div>

      {/* 新規セクション作成フォーム */}
      {showNewSectionForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 className="text-md font-bold text-gray-900 dark:text-gray-50 mb-4">
            新規セクション
          </h4>
          <SectionForm
            courseId={courseId}
            onCancel={() => setShowNewSectionForm(false)}
            onSuccess={() => setShowNewSectionForm(false)}
          />
        </div>
      )}

      {/* セクション一覧 */}
      {sortedSections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            まだセクションがありません
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSections.map((section, index) => {
            const isExpanded = expandedSections.has(section.id)
            const isEditing = editingSection === section.id
            const sortedLessons = [...section.lessons].sort((a, b) => a.order - b.order)

            return (
              <div
                key={section.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
              >
                {/* セクションヘッダー */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-50">
                      {section.order}. {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {section.description}
                      </p>
                    )}
                  </div>

                  {/* セクション操作ボタン */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveSection(section.id, 'up')}
                      disabled={index === 0 || isPending}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="上へ移動"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveSection(section.id, 'down')}
                      disabled={index === sortedSections.length - 1 || isPending}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="下へ移動"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingSection(section.id)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-50 rounded transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id, section.title)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-sm border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>

                {/* セクション編集フォーム */}
                {isEditing && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <SectionForm
                      courseId={courseId}
                      section={section}
                      onCancel={() => setEditingSection(null)}
                      onSuccess={() => setEditingSection(null)}
                    />
                  </div>
                )}

                {/* セクション内容（展開時） */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    {/* レッスン一覧 */}
                    <div className="space-y-2 mb-4">
                      {sortedLessons.map((lesson, lessonIndex) => {
                        const isEditingLesson = editingLesson === lesson.id

                        return (
                          <div
                            key={lesson.id}
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                          >
                            {isEditingLesson ? (
                              <LessonForm
                                sectionId={section.id}
                                lesson={lesson}
                                onCancel={() => setEditingLesson(null)}
                                onSuccess={() => setEditingLesson(null)}
                              />
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-50">
                                    {lesson.order}. {lesson.title}
                                  </div>
                                  {lesson.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {lesson.description}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    動画ID: {lesson.youtube_video_id}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleMoveLesson(lesson.id, 'up')}
                                    disabled={lessonIndex === 0 || isPending}
                                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="上へ移動"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 15l7-7 7 7"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleMoveLesson(lesson.id, 'down')}
                                    disabled={lessonIndex === sortedLessons.length - 1 || isPending}
                                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="下へ移動"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setEditingLesson(lesson.id)}
                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-50 rounded transition-colors"
                                  >
                                    編集
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                    disabled={isPending}
                                    className="px-2 py-1 text-xs border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                                  >
                                    削除
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* 新規レッスン追加 */}
                    {addingSectionId === section.id ? (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <h5 className="text-sm font-bold text-gray-900 dark:text-gray-50 mb-3">
                          新規レッスン
                        </h5>
                        <LessonForm
                          sectionId={section.id}
                          onCancel={() => setAddingSectionId(null)}
                          onSuccess={() => setAddingSectionId(null)}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingSectionId(section.id)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        + レッスンを追加
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
