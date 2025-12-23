-- Enable Row Level Security on all tables
-- This migration adds comprehensive RLS policies to protect data access

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile (for new signups)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. PROGRESS TABLE
-- ============================================================
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
ON progress FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
ON progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
ON progress FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own progress (if needed for reset)
CREATE POLICY "Users can delete own progress"
ON progress FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- 3. COURSES TABLE
-- ============================================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Everyone can view courses (public catalog)
CREATE POLICY "Courses are viewable by everyone"
ON courses FOR SELECT
USING (true);

-- Only admins can insert courses
CREATE POLICY "Only admins can insert courses"
ON courses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can update courses
CREATE POLICY "Only admins can update courses"
ON courses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can delete courses
CREATE POLICY "Only admins can delete courses"
ON courses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================
-- 4. SECTIONS TABLE
-- ============================================================
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Everyone can view sections
CREATE POLICY "Sections are viewable by everyone"
ON sections FOR SELECT
USING (true);

-- Only admins can insert sections
CREATE POLICY "Only admins can insert sections"
ON sections FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can update sections
CREATE POLICY "Only admins can update sections"
ON sections FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can delete sections
CREATE POLICY "Only admins can delete sections"
ON sections FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================
-- 5. LESSONS TABLE
-- ============================================================
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Everyone can view lessons
CREATE POLICY "Lessons are viewable by everyone"
ON lessons FOR SELECT
USING (true);

-- Only admins can insert lessons
CREATE POLICY "Only admins can insert lessons"
ON lessons FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can update lessons
CREATE POLICY "Only admins can update lessons"
ON lessons FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can delete lessons
CREATE POLICY "Only admins can delete lessons"
ON lessons FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================
-- 6. CATEGORIES TABLE
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Categories are viewable by everyone"
ON categories FOR SELECT
USING (true);

-- Only admins can insert categories
CREATE POLICY "Only admins can insert categories"
ON categories FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can update categories
CREATE POLICY "Only admins can update categories"
ON categories FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can delete categories
CREATE POLICY "Only admins can delete categories"
ON categories FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================
-- 7. TAGS TABLE
-- ============================================================
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Everyone can view tags
CREATE POLICY "Tags are viewable by everyone"
ON tags FOR SELECT
USING (true);

-- Only admins can insert tags
CREATE POLICY "Only admins can insert tags"
ON tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can update tags
CREATE POLICY "Only admins can update tags"
ON tags FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can delete tags
CREATE POLICY "Only admins can delete tags"
ON tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================
-- 8. COURSE_TAGS TABLE (junction table)
-- ============================================================
ALTER TABLE course_tags ENABLE ROW LEVEL SECURITY;

-- Everyone can view course_tags relationships
CREATE POLICY "Course tags are viewable by everyone"
ON course_tags FOR SELECT
USING (true);

-- Only admins can insert course_tags
CREATE POLICY "Only admins can insert course_tags"
ON course_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can delete course_tags
CREATE POLICY "Only admins can delete course_tags"
ON course_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================
-- NOTES:
-- ============================================================
-- 1. These policies ensure that:
--    - All users can read public content (courses, lessons, etc.)
--    - Only authenticated users can manage their own progress
--    - Only admins can create/update/delete course content
--
-- 2. Apply this migration using Supabase CLI:
--    supabase db push
--
-- 3. Or apply manually via Supabase Dashboard:
--    Database > SQL Editor > Run this file
--
-- 4. Test all application flows after enabling RLS to ensure
--    everything still works as expected.
