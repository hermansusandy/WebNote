-- Rename tables
ALTER TABLE software_categories RENAME TO youtube_categories;
ALTER TABLE software_items RENAME TO youtube_items;

-- Rename indexes (optional but good for consistency)
ALTER INDEX software_items_user_category_idx RENAME TO youtube_items_user_category_idx;
