alter table learning_titles add column category text;
create index learning_titles_category_idx on learning_titles(category);
