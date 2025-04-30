# REST API Plan

## 1. Resources

- **Users** - Corresponds to the `users` table managed by Supabase Auth
- **Projects** - Corresponds to the `projects` table 
- **AI Questions** - Corresponds to the `ai_questions` table

## 2. Endpoints

### Authentication

Supabase Auth will handle authentication via its built-in endpoints. The following endpoints are automatically provided:

- `POST /auth/v1/signup` - Register a new user
- `POST /auth/v1/token?grant_type=password` - Login with email and password
- `POST /auth/v1/recover` - Request password recovery email
- `PUT /auth/v1/user` - Update user data

### Projects

#### Get All Projects

- **Method**: GET
- **Path**: `/api/projects`
- **Description**: Retrieve paginated list of user's projects
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term for project name
  - `status` (optional): Filter by project status ('new', 'in_progress', 'finished')
  - `sort` (optional): Sort by field (default: 'created_at')
  - `order` (optional): Sort order ('asc' or 'desc', default: 'desc')
- **Request Body**: N/A
- **Response Body**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "Project Description",
      "status": "new|in_progress|finished",
      "created_at": "ISO timestamp",
      "updated_at": "ISO timestamp"
    }
  ],
  "pagination": {
    "total_count": 25,
    "page_count": 3,
    "current_page": 1,
    "per_page": 10
  }
}
```
- **Success Codes**:
  - 200 OK: Successfully retrieved projects
- **Error Codes**:
  - 401 Unauthorized: User not authenticated
  - 400 Bad Request: Invalid query parameters

#### Get Project by ID

- **Method**: GET
- **Path**: `/api/projects/:id`
- **Description**: Retrieve detailed information about a specific project
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response Body**:
```json
{
  "id": "uuid",
  "name": "Project Name",
  "description": "Project Description",
  "status": "new|in_progress|finished",
  "main_problem": "Main problem description",
  "min_feature_set": "Minimum feature set description",
  "out_of_scope": "Out of scope items",
  "success_criteria": "Success criteria description",
  "prd": "Generated PRD document content",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```
- **Success Codes**:
  - 200 OK: Successfully retrieved project
- **Error Codes**:
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User does not have access to this project
  - 404 Not Found: Project not found

#### Create Project

- **Method**: POST
- **Path**: `/api/projects`
- **Description**: Create a new project
- **Query Parameters**: N/A
- **Request Body**:
```json
{
  "name": "Project Name", // required
  "description": "Project Description", // optional
  "main_problem": "Main problem description", // optional
  "min_feature_set": "Minimum feature set description", // optional
  "out_of_scope": "Out of scope items", // optional
  "success_criteria": "Success criteria description" // optional
}
```
- **Response Body**:
```json
{
  "id": "uuid",
  "name": "Project Name",
  "description": "Project Description",
  "status": "new",
  "main_problem": "Main problem description",
  "min_feature_set": "Minimum feature set description",
  "out_of_scope": "Out of scope items",
  "success_criteria": "Success criteria description",
  "prd": "Generated PRD document content",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```
- **Success Codes**:
  - 201 Created: Successfully created project
- **Error Codes**:
  - 401 Unauthorized: User not authenticated
  - 400 Bad Request: Invalid request body

#### Update Project

- **Method**: PUT
- **Path**: `/api/projects/:id`
- **Description**: Update an existing project
- **Query Parameters**: N/A
- **Request Body**:
```json
{
  "name": "Updated Project Name", // optional
  "description": "Updated Project Description", // optional
  "status": "in_progress", // optional
  "main_problem": "Updated main problem description", // optional
  "min_feature_set": "Updated minimum feature set description", // optional
  "out_of_scope": "Updated out of scope items", // optional
  "success_criteria": "Updated success criteria description" // optional
}
```
- **Response Body**:
```json
{
  "id": "uuid",
  "name": "Updated Project Name",
  "description": "Updated Project Description",
  "status": "in_progress",
  "main_problem": "Updated main problem description",
  "min_feature_set": "Updated minimum feature set description",
  "out_of_scope": "Updated out of scope items",
  "success_criteria": "Updated success criteria description",
  "prd": "Updated PRD document content",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```
- **Success Codes**:
  - 200 OK: Successfully updated project
- **Error Codes**:
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User does not have access to this project
  - 404 Not Found: Project not found
  - 400 Bad Request: Invalid request body

#### Delete Project

- **Method**: DELETE
- **Path**: `/api/projects/:id`
- **Description**: Delete a project
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response Body**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```
- **Success Codes**:
  - 200 OK: Successfully deleted project
- **Error Codes**:
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User does not have access to this project
  - 404 Not Found: Project not found

### AI Questions

#### Get AI Questions for Project

- **Method**: GET
- **Path**: `/api/projects/:id/ai-questions`
- **Description**: Retrieve all AI questions for a project
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Request Body**: N/A
- **Response Body**:
```json
{
  "data": [
    {
      "id": "uuid",
      "question": "What is the main problem your project solves?",
      "answer": "The user's answer to the question",
      "sequence_number": 1,
      "created_at": "ISO timestamp"
    }
  ],
  "pagination": {
    "total_count": 15,
    "page_count": 2,
    "current_page": 1,
    "per_page": 10
  }
}
```
- **Success Codes**:
  - 200 OK: Successfully retrieved AI questions
- **Error Codes**:
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User does not have access to this project
  - 404 Not Found: Project not found

#### Add AI Question and Answer

- **Method**: POST
- **Path**: `/api/projects/:id/ai-questions`
- **Description**: Add a new AI question and answer pair to a project
- **Query Parameters**: N/A
- **Request Body**:
```json
{
  "question": "What is the main problem your project solves?", // required
  "answer": "The user's answer to the question", // required
  "sequence_number": 1 // required
}
```
- **Response Body**:
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "question": "What is the main problem your project solves?",
  "answer": "The user's answer to the question",
  "sequence_number": 1,
  "created_at": "ISO timestamp"
}
```
- **Success Codes**:
  - 201 Created: Successfully added AI question
- **Error Codes**:
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User does not have access to this project
  - 404 Not Found: Project not found
  - 400 Bad Request: Invalid request body

#### Update AI Question Answer

- **Method**: PUT
- **Path**: `/api/projects/:project_id/ai-questions/:id`
- **Description**: Update an existing AI question's answer
- **Query Parameters**: N/A
- **Request Body**:
```json
{
  "answer": "Updated answer to the question" // required
}
```
- **Response Body**:
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "question": "What is the main problem your project solves?",
  "answer": "Updated answer to the question",
  "sequence_number": 1,
  "created_at": "ISO timestamp"
}
```
- **Success Codes**:
  - 200 OK: Successfully updated AI question
- **Error Codes**:
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User does not have access to this project
  - 404 Not Found: AI question not found
  - 400 Bad Request: Invalid request body

#### Delete AI Question

- **Method**: DELETE
- **Path**: `/api/projects/:project_id/ai-questions/:id`
- **Description**: Delete an AI question
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response Body**:
```json
{
  "success": true,
  "message": "AI question deleted successfully"
}
```
- **Success Codes**:
  - 200 OK: Successfully deleted AI question
- **Error Codes**:
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User does not have access to this project
  - 404 Not Found: AI question not found

### PRD Generation

#### Generate PRD

- **Method**: POST
- **Path**: `/api/projects/:id/generate-prd`
- **Description**: Generate a PRD document based on project details and AI questions, and store it in the project's `prd` field
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response Body**:
```json
{
  "project": {
    "id": "uuid",
    "name": "Project Name",
    "description": "Project Description",
    "status": "finished",
    "main_problem": "Main problem description",
    "min_feature_set": "Minimum feature set description",
    "out_of_scope": "Out of scope items",
    "success_criteria": "Success criteria description",
    "prd": "# PRD Document\n\n## Overview\n...",
    "created_at": "ISO timestamp",
    "updated_at": "ISO timestamp"
  },
  "status": "success",
  "generated_at": "ISO timestamp"
}
```
- **Success Codes**:
  - 200 OK: Successfully generated PRD
- **Error Codes**:
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User does not have access to this project
  - 404 Not Found: Project not found
  - 422 Unprocessable Entity: Not enough information to generate PRD

#### Get Next AI Question

- **Method**: GET
- **Path**: `/api/projects/:id/next-question`
- **Description**: Get the next AI question based on previous answers
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response Body**:
```json
{
  "question": "What specific features would you consider essential for your minimum viable product?",
  "sequence_number": 5
}
```
- **Success Codes**:
  - 200 OK: Successfully retrieved next question
- **Error Codes**:
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User does not have access to this project
  - 404 Not Found: Project not found

## 3. Authentication and Authorization

The API will use Supabase Authentication for user management and authorization.

### Authentication Mechanism

- JWT (JSON Web Tokens) based authentication provided by Supabase
- Access tokens are sent in the Authorization header: `Authorization: Bearer <token>`
- Tokens expire after a configurable time period (default: 1 hour)
- Refresh tokens can be used to obtain new access tokens without requiring re-login

### Authorization Implementation

- Row Level Security (RLS) policies are implemented at the database level to ensure users can only access their own data
- Each API endpoint verifies the user's permissions before performing operations
- Projects are only accessible to their owners
- AI Questions are only accessible to users who own the associated project

## 4. Validation and Business Logic

### Project Resource Validation

- `name`: Required, string
- `description`: Optional, string
- `status`: Must be one of 'new', 'in_progress', 'finished'
- `main_problem`: Optional, string
- `min_feature_set`: Optional, string
- `out_of_scope`: Optional, string
- `success_criteria`: Optional, string
- `prd`: Optional, string

### AI Question Resource Validation

- `question`: Required, string
- `answer`: Required, string
- `sequence_number`: Required, integer, must be unique per project

### Business Logic Implementation

1. **Project Management**:
   - When a project is created, its initial status is set to 'new'
   - When user starts process, project status is updated to 'in_progress'
   - When PRD is generated, project status is updated to 'finished'

2. **AI Question Sequence**:
   - First four questions are predefined based on the PRD document
   - Subsequent questions are generated by the AI based on previous answers
   - Questions follow a logical flow: problem definition → features → UX → metrics → risks → timeline

3. **PRD Generation**:
   - PRD is generated using the project details and all AI questions/answers
   - The generation process uses AI models accessed through Openrouter.ai
   - The generated PRD follows a standardized structure

4. **Security Measures**:
   - Rate limiting is implemented to prevent abuse
   - Input validation is performed on all endpoints
   - Row Level Security enforces data isolation between users
