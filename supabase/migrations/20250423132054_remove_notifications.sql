-- Migration: Remove Notifications Table
-- Description: Removes the notifications table and related objects
-- Author: Cascade AI
-- Date: 2025-04-23

-- Drop policies first
drop policy if exists "Users can view their own notifications" on notifications;
drop policy if exists "Users can insert their own notifications" on notifications;
drop policy if exists "Users can delete their own notifications" on notifications;

-- Drop indexes
drop index if exists idx_notifications_user_id;
drop index if exists idx_notifications_created_at;

-- Drop the table
drop table if exists notifications;
