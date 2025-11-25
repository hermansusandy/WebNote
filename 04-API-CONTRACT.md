# 04-API-CONTRACT.md
## API Style
Use Supabase auto-generated REST + client SDK.

## Key Queries
### Pages
- listPages(user_id)
- listChildPages(parent_id)
- getPage(id)
- createPage({title, parent_id?})
- updatePage(id, patch)
- deletePage(id)

### Page Blocks
- listBlocks(page_id)
- createBlock({page_id, type, content, sort_order})
- updateBlock(id, patch)
- deleteBlock(id)
- reorderBlocks(page_id, ordered_ids[])

### Learning Titles
- listLearningTitles(filters, sort)
- getLearningTitle(id)
- createLearningTitle(payload)
- updateLearningTitle(id, patch)
- deleteLearningTitle(id)

### Learning Points
- listLearningPoints(learning_title_id)
- addLearningPoint(payload)
- toggleLearningPointDone(id, bool)
- reorderLearningPoints(learning_title_id, ordered_ids[])

### Reminders
- listReminders(range/today/upcoming)
- createReminder(payload)
- markReminderDone(id, bool)

### Software
- listCategories()
- createCategory()
- listSoftwareItems(category_id?)
- createSoftwareItem()
- updateSoftwareItem()
- deleteSoftwareItem()
