export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    display_name: string | null
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    display_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    display_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            pages: {
                Row: {
                    id: string
                    user_id: string
                    parent_id: string | null
                    title: string
                    icon: string | null
                    cover_url: string | null
                    sort_order: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    parent_id?: string | null
                    title?: string
                    icon?: string | null
                    cover_url?: string | null
                    sort_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    parent_id?: string | null
                    title?: string
                    icon?: string | null
                    cover_url?: string | null
                    sort_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            page_blocks: {
                Row: {
                    id: string
                    page_id: string
                    user_id: string
                    type: string
                    content: Json | null
                    sort_order: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    page_id: string
                    user_id: string
                    type: string
                    content?: Json | null
                    sort_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    page_id?: string
                    user_id?: string
                    type?: string
                    content?: Json | null
                    sort_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            learning_titles: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    priority: 'Low' | 'Medium' | 'High' | 'Urgent' | null
                    status: 'Planned' | 'In Progress' | 'Done' | 'Paused' | null
                    start_date: string | null
                    target_date: string | null
                    duration_days: number | null
                    linked_page_id: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    priority?: 'Low' | 'Medium' | 'High' | 'Urgent' | null
                    status?: 'Planned' | 'In Progress' | 'Done' | 'Paused' | null
                    start_date?: string | null
                    target_date?: string | null
                    duration_days?: number | null
                    linked_page_id?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    priority?: 'Low' | 'Medium' | 'High' | 'Urgent' | null
                    status?: 'Planned' | 'In Progress' | 'Done' | 'Paused' | null
                    start_date?: string | null
                    target_date?: string | null
                    duration_days?: number | null
                    linked_page_id?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            learning_points: {
                Row: {
                    id: string
                    learning_title_id: string
                    user_id: string
                    content: string
                    is_done: boolean | null
                    sort_order: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    learning_title_id: string
                    user_id: string
                    content: string
                    is_done?: boolean | null
                    sort_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    learning_title_id?: string
                    user_id?: string
                    content?: string
                    is_done?: boolean | null
                    sort_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            reminders: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    due_at: string | null
                    repeat_rule: string | null
                    is_done: boolean | null
                    linked_page_id: string | null
                    linked_learning_title_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    due_at?: string | null
                    repeat_rule?: string | null
                    is_done?: boolean | null
                    linked_page_id?: string | null
                    linked_learning_title_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    due_at?: string | null
                    repeat_rule?: string | null
                    is_done?: boolean | null
                    linked_page_id?: string | null
                    linked_learning_title_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            software_categories: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    color: string | null
                    sort_order: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    color?: string | null
                    sort_order?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    color?: string | null
                    sort_order?: number | null
                    created_at?: string
                }
            }
            software_items: {
                Row: {
                    id: string
                    user_id: string
                    category_id: string
                    name: string
                    tags: string[] | null
                    url: string | null
                    note: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    category_id: string
                    name: string
                    tags?: string[] | null
                    url?: string | null
                    note?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    category_id?: string
                    name?: string
                    tags?: string[] | null
                    url?: string | null
                    note?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
