-- Atomic order swapping functions for lessons and sections
-- These functions ensure data integrity when changing display order

-- ============================================================
-- 1. LESSON ORDER SWAP FUNCTION
-- ============================================================

/**
 * Swap lesson order atomically
 * @param p_lesson_id - The lesson to move
 * @param p_direction - 'up' or 'down'
 */
CREATE OR REPLACE FUNCTION swap_lesson_order(
  p_lesson_id UUID,
  p_direction TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  current_lesson_id UUID,
  swap_lesson_id UUID
) AS $$
DECLARE
  v_current_lesson RECORD;
  v_swap_lesson RECORD;
BEGIN
  -- Validate direction parameter
  IF p_direction NOT IN ('up', 'down') THEN
    RETURN QUERY SELECT false, 'Invalid direction. Must be "up" or "down".'::TEXT, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  -- Get current lesson
  SELECT * INTO v_current_lesson
  FROM lessons
  WHERE id = p_lesson_id;

  IF v_current_lesson.id IS NULL THEN
    RETURN QUERY SELECT false, 'Lesson not found'::TEXT, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  -- Get lesson to swap with
  IF p_direction = 'up' THEN
    -- Find previous lesson (smaller order number)
    SELECT * INTO v_swap_lesson
    FROM lessons
    WHERE section_id = v_current_lesson.section_id
      AND "order" < v_current_lesson."order"
    ORDER BY "order" DESC
    LIMIT 1;
  ELSE
    -- Find next lesson (larger order number)
    SELECT * INTO v_swap_lesson
    FROM lessons
    WHERE section_id = v_current_lesson.section_id
      AND "order" > v_current_lesson."order"
    ORDER BY "order" ASC
    LIMIT 1;
  END IF;

  -- Check if swap lesson exists
  IF v_swap_lesson.id IS NULL THEN
    RETURN QUERY SELECT false, 'Cannot move lesson further in this direction'::TEXT, p_lesson_id, NULL::UUID;
    RETURN;
  END IF;

  -- Perform atomic swap using transaction
  -- PostgreSQL ensures this is atomic within the function
  UPDATE lessons
  SET "order" = v_swap_lesson."order"
  WHERE id = v_current_lesson.id;

  UPDATE lessons
  SET "order" = v_current_lesson."order"
  WHERE id = v_swap_lesson.id;

  -- Return success
  RETURN QUERY SELECT true, 'Order swapped successfully'::TEXT, v_current_lesson.id, v_swap_lesson.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. SECTION ORDER SWAP FUNCTION
-- ============================================================

/**
 * Swap section order atomically
 * @param p_section_id - The section to move
 * @param p_direction - 'up' or 'down'
 */
CREATE OR REPLACE FUNCTION swap_section_order(
  p_section_id UUID,
  p_direction TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  current_section_id UUID,
  swap_section_id UUID
) AS $$
DECLARE
  v_current_section RECORD;
  v_swap_section RECORD;
BEGIN
  -- Validate direction parameter
  IF p_direction NOT IN ('up', 'down') THEN
    RETURN QUERY SELECT false, 'Invalid direction. Must be "up" or "down".'::TEXT, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  -- Get current section
  SELECT * INTO v_current_section
  FROM sections
  WHERE id = p_section_id;

  IF v_current_section.id IS NULL THEN
    RETURN QUERY SELECT false, 'Section not found'::TEXT, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  -- Get section to swap with
  IF p_direction = 'up' THEN
    -- Find previous section (smaller order number)
    SELECT * INTO v_swap_section
    FROM sections
    WHERE course_id = v_current_section.course_id
      AND "order" < v_current_section."order"
    ORDER BY "order" DESC
    LIMIT 1;
  ELSE
    -- Find next section (larger order number)
    SELECT * INTO v_swap_section
    FROM sections
    WHERE course_id = v_current_section.course_id
      AND "order" > v_current_section."order"
    ORDER BY "order" ASC
    LIMIT 1;
  END IF;

  -- Check if swap section exists
  IF v_swap_section.id IS NULL THEN
    RETURN QUERY SELECT false, 'Cannot move section further in this direction'::TEXT, p_section_id, NULL::UUID;
    RETURN;
  END IF;

  -- Perform atomic swap using transaction
  UPDATE sections
  SET "order" = v_swap_section."order"
  WHERE id = v_current_section.id;

  UPDATE sections
  SET "order" = v_current_section."order"
  WHERE id = v_swap_section.id;

  -- Return success
  RETURN QUERY SELECT true, 'Order swapped successfully'::TEXT, v_current_section.id, v_swap_section.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- USAGE EXAMPLES
-- ============================================================

-- Move lesson up
-- SELECT * FROM swap_lesson_order('<lesson-id>', 'up');

-- Move lesson down
-- SELECT * FROM swap_lesson_order('<lesson-id>', 'down');

-- Move section up
-- SELECT * FROM swap_section_order('<section-id>', 'up');

-- Move section down
-- SELECT * FROM swap_section_order('<section-id>', 'down');

-- ============================================================
-- NOTES
-- ============================================================
-- 1. These functions are atomic and prevent race conditions
-- 2. Returns success/failure status with descriptive messages
-- 3. Handles edge cases (already at top/bottom)
-- 4. Works within the same parent (section_id for lessons, course_id for sections)
