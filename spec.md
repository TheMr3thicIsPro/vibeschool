# Post-Lesson Interactive File System Specification

## Overview
A system to allow instructors to upload interactive coding exercises (files) to lessons, and students to download them, complete the work, and submit their solutions.

## Database Schema

### 1. `lesson_resources`
Stores files uploaded by instructors for a lesson.
- `id`: UUID (PK)
- `lesson_id`: UUID (FK to lessons)
- `title`: VARCHAR(255)
- `description`: TEXT
- `file_url`: TEXT (Supabase Storage URL)
- `file_name`: TEXT (Original filename)
- `file_size`: BIGINT
- `file_type`: VARCHAR(50) (e.g., 'source', 'asset', 'archive')
- `exercise_type`: VARCHAR(20) (e.g., 'none', 'debug', 'complete', 'recreate')
    - 'none': Just a download (reference material).
    - 'debug': A debugging challenge.
    - 'complete': Finish the code/game.
    - 'recreate': Recreate the project from scratch/template.
- `difficulty`: VARCHAR(20) ('beginner', 'intermediate', 'advanced')
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### 2. `resource_submissions`
Stores student submissions for interactive resources.
- `id`: UUID (PK)
- `resource_id`: UUID (FK to lesson_resources)
- `user_id`: UUID (FK to profiles)
- `submission_file_url`: TEXT (Supabase Storage URL)
- `submission_text`: TEXT (Optional comment/code snippet)
- `status`: VARCHAR(20) ('pending', 'approved', 'changes_requested')
- `feedback`: TEXT (Instructor feedback)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## Storage Buckets
1.  `lesson-resources`: Public/Authenticated Read. Admin Write.
2.  `resource-submissions`: Authenticated Read (Own/Admin). Authenticated Write (Own).

## UI/UX

### Admin (Instructor)
- **Lesson Editor**:
    - New "Resources" tab.
    - File uploader (Drag & Drop).
    - Form for each resource: Title, Description, Type, Difficulty.
    - List of uploaded resources with Edit/Delete.
    - View student submissions for each resource.

### Student (Lesson View)
- **Resources Section** (below video/content):
    - Card grid/list of resources.
    - Icons based on file type.
    - Badge for Difficulty and Exercise Type.
    - **Download Button**.
- **Submission Interface** (for exercises):
    - If `exercise_type` != 'none':
        - "Submit Work" button.
        - Modal/Section to upload file or paste link/code.
        - Status indicator (Pending, Approved).
        - Feedback display.

## API / Server Actions
- `uploadLessonResource`: Admin only. Uploads file, creates DB record.
- `deleteLessonResource`: Admin only.
- `submitResourceWork`: Student. Uploads file, creates submission record.
- `gradeSubmission`: Admin. Updates status and feedback.
- `getLessonResources`: Public/Auth.
- `getUserSubmissions`: Auth.

## Security (RLS)
- `lesson_resources`:
    - Select: Public (or Authenticated/Member based on lesson visibility).
    - Insert/Update/Delete: Admin only.
- `resource_submissions`:
    - Select: Own submissions OR Admin.
    - Insert: Authenticated users.
    - Update: Own (if pending) OR Admin.

## Implementation Steps
1.  Create SQL Migration (`lesson_resources`, `resource_submissions`, Buckets, RLS).
2.  Update `types/course.ts` (or new types file).
3.  Create Server Actions (`src/actions/resourceActions.ts`).
4.  Update Admin UI (`LessonEditor.tsx`).
5.  Update Student UI (`src/app/learn/[lessonId]/page.tsx`).
