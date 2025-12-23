/**
 * Entity type definitions for the e-learning platform
 * These types extend the base database types with relationships
 */

import { Database } from './database.types'

// Base table types from database
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

// ============================================================
// CORE ENTITY TYPES
// ============================================================

export type Category = Tables<'categories'>

export type Tag = Tables<'tags'>

export type Profile = Tables<'profiles'>

// ============================================================
// LESSON TYPES
// ============================================================

export type Lesson = Tables<'lessons'>

export type LessonWithSection = Lesson & {
  section: Section
}

export type LessonWithSectionAndCourse = Lesson & {
  section: SectionWithCourse
}

// ============================================================
// SECTION TYPES
// ============================================================

export type Section = Tables<'sections'>

export type SectionWithLessons = Section & {
  lessons: Lesson[]
}

export type SectionWithCourse = Section & {
  course: Course
}

export type SectionWithLessonsAndCourse = Section & {
  lessons: Lesson[]
  course: Course
}

// ============================================================
// COURSE TYPES
// ============================================================

export type Course = Tables<'courses'>

export type CourseWithCategory = Course & {
  category: Category | null
}

export type CourseWithTags = Course & {
  course_tags: Array<{
    tag: Tag
  }>
}

export type CourseWithSections = Course & {
  sections: Section[]
}

export type CourseWithSectionsAndLessons = Course & {
  sections: SectionWithLessons[]
}

export type CourseDetail = Course & {
  category: Category | null
  course_tags: Array<{
    tag: Tag
  }>
  sections: SectionWithLessons[]
}

// ============================================================
// PROGRESS TYPES
// ============================================================

export type Progress = Tables<'progress'>

export type ProgressWithLesson = Progress & {
  lesson: Lesson
}

export type ProgressWithLessonAndSection = Progress & {
  lesson: LessonWithSection
}

// ============================================================
// UTILITY TYPES
// ============================================================

/**
 * Type for sorted sections with sorted lessons
 */
export type SortedSection = Section & {
  lessons: Lesson[]
}

/**
 * Type for course with sorted sections and lessons
 */
export type CourseWithSortedContent = Course & {
  category: Category | null
  course_tags: Array<{
    tag: Tag
  }>
  sections: SortedSection[]
}

/**
 * Type for user course enrollment (for "My Courses" page)
 */
export type UserCourseEnrollment = {
  course: CourseWithCategory
  completedLessons: number
  totalLessons: number
  progressPercentage: number
  lastAccessedAt: string | null
}

/**
 * Type for lesson navigation (prev/next)
 */
export type LessonNavigation = {
  previous: Lesson | null
  current: Lesson
  next: Lesson | null
  section: Section
  course: Course
}

// ============================================================
// INSERT/UPDATE TYPES
// ============================================================

export type CourseInsert = Database['public']['Tables']['courses']['Insert']
export type CourseUpdate = Database['public']['Tables']['courses']['Update']

export type SectionInsert = Database['public']['Tables']['sections']['Insert']
export type SectionUpdate = Database['public']['Tables']['sections']['Update']

export type LessonInsert = Database['public']['Tables']['lessons']['Insert']
export type LessonUpdate = Database['public']['Tables']['lessons']['Update']

export type ProgressInsert = Database['public']['Tables']['progress']['Insert']
export type ProgressUpdate = Database['public']['Tables']['progress']['Update']

export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type TagUpdate = Database['public']['Tables']['tags']['Update']

// ============================================================
// ADMIN TYPES
// ============================================================

/**
 * Type for admin user check
 */
export type AdminProfile = Profile & {
  role: 'admin'
}

/**
 * Type guard to check if user is admin
 */
export function isAdmin(profile: Profile | null): profile is AdminProfile {
  return profile?.role === 'admin'
}
