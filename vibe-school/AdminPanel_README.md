# Vibe Coding School Admin Panel v2

## Overview
The admin panel provides a comprehensive course management system for educators and administrators to create and manage educational content.

## Features
- **Course Management**: Create, edit, and publish courses
- **Module Organization**: Organize lessons into structured modules
- **Lesson Editor**: Create lessons with embedded YouTube videos
- **Drag & Drop Ordering**: Easily reorder courses, modules, and lessons
- **Content Publishing**: Control what content is visible to students
- **Free/Premium Content**: Mark lessons as free previews or premium content

## Access Requirements
- **Admin Role**: Full access to all admin features
- **Teacher Role**: Access to course management features

## How to Use

### Course Management
1. Navigate to the Admin Panel from the dashboard
2. Select the "Manage Courses" tab
3. Use the left column to view and manage courses
4. Click the "+" button to create a new course
5. Enter course title and description
6. Toggle the eye icon to publish/unpublish courses

### Module Management
1. Select a course from the left column
2. The middle column will show modules for that course
3. Click the "+" button to add a new module
4. Drag and drop modules to reorder them
5. Delete modules using the trash icon

### Lesson Management
1. Select a module from the middle column
2. The right column will show lessons for that module
3. Click "+ Add Lesson" at the bottom to create a new lesson
4. Edit lessons using the pencil icon
5. Delete lessons using the trash icon
6. Drag and drop lessons to reorder them

### Creating Lessons
1. Click "+ Add Lesson" when a module is selected
2. Enter lesson title and description
3. Paste a YouTube URL or video ID in the YouTube URL field
   - Supports: watch?v=, youtu.be/, embed/, shorts/
4. Toggle "Preview" to make the lesson available to free users
5. Toggle "Published" to control visibility to students
6. Preview the video in the embedded player
7. Click "Create Lesson" to save

### Editing Lessons
1. Click the pencil icon next to any lesson
2. Make your desired changes
3. Click "Update Lesson" to save

## Technical Details

### Data Model
- **Courses**: Top-level containers for educational content
- **Modules**: Organizational units within courses
- **Lessons**: Individual learning units with embedded videos

### YouTube Integration
- Supports multiple YouTube URL formats
- Automatically extracts video ID and generates embed URL
- Embedded players allow preview during editing

### Drag & Drop Functionality
- Courses can be reordered within the course list
- Modules can be reordered within each course
- Lessons can be reordered within each module
- Changes are saved automatically when reordering

### Security
- Server-side role verification for all admin actions
- RLS policies ensure only authorized users can modify content
- Client-side UI hides admin features for unauthorized users

## Troubleshooting

### Common Issues
- **Permission Denied**: Ensure your account has admin or teacher role
- **YouTube URLs Not Working**: Verify the URL format is supported
- **Drag & Drop Not Responding**: Refresh the page if the UI becomes unresponsive
- **Videos Not Embedding**: Check that the YouTube URL is valid and public/unlisted

### Error Messages
- "Access denied. Admin or teacher role required." - Contact administrator to update your role
- "Invalid YouTube URL or video ID" - Verify the URL format
- "Failed to load" - Check internet connection and try refreshing

## Best Practices
- Publish courses only when all content is ready
- Use descriptive titles and descriptions for easy navigation
- Organize content in logical modules
- Test embedded videos before publishing
- Use preview flag for introductory content accessible to free users