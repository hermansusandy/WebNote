-- Rename tables
ALTER TABLE software_categories RENAME TO youtube_categories;
ALTER TABLE software_items RENAME TO youtube_items;

-- Rename indexes (optional but good for consistency)
ALTER INDEX software_items_user_category_idx RENAME TO youtube_items_user_category_idx;

-- Update RLS policies
-- Drop old policies
DROP POLICY "Users can crud own software_categories" ON youtube_categories;
DROP POLICY "Users can crud own software_items" ON youtube_items;

-- Create new policies
CREATE POLICY "Users can crud own youtube_categories" ON youtube_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can crud own youtube_items" ON youtube_items FOR ALL USING (auth.uid() = user_id);
