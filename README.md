# Project Manager (10x-project-manager)

[![Project Status](https://img.shields.io/badge/status-in_development-yellow)](https://github.com/kkaliszczak-sembot/10x-project-manager)
[![Version](https://img.shields.io/badge/version-0.0.1-blue)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

Project Manager is an AI-powered web application that helps users transform rough project ideas into detailed, structured Product Requirement Documents (PRDs) through an interactive, iterative process. Built for individuals and teams seeking clarity and acceleration in project planning.

---

## Table of Contents
1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started Locally](#getting-started-locally)
4. [Available Scripts](#available-scripts)
5. [Project Scope](#project-scope)
6. [Project Status](#project-status)
7. [License](#license)

---

## Project Description
Project Manager is a web application designed to guide users from initial project ideas to comprehensive PRDs. Leveraging AI, it iteratively asks clarifying questions and helps structure project documentation, making the process accessible and efficient for both technical and non-technical users.

---

## Tech Stack

**Frontend:**
- Astro 5: Fast, minimal-JS static site generator
- Vue 3: Interactive UI components
- TypeScript 5: Static typing and IDE support
- Tailwind CSS 4: Utility-first styling
- Shadcn/ui: Accessible UI component library

**Backend:**
- Supabase: Open-source backend-as-a-service (PostgreSQL DB, SDK, authentication)

**AI Integration:**
- Openrouter.ai: Access to multiple AI models (OpenAI, Anthropic, Google, etc.), with API key cost controls

**CI/CD & Hosting:**
- GitHub Actions: Automated pipelines
- Custom VPS: Dockerized deployment

---

## Getting Started Locally

### Prerequisites
- **Node.js:** v22.14.0 ([`.nvmrc`](./.nvmrc))
- **npm** (comes with Node.js)

### Installation
```bash
# Clone the repository
git clone https://github.com/kkaliszczak-sembot/10x-project-manager.git
cd 10x-project-manager

# Use correct Node version
nvm use

# Install dependencies
npm install
```

### Running the Project
```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Available Scripts

- `npm run dev` — Start the Astro development server
- `npm run build` — Build the application for production
- `npm run preview` — Preview the built application locally
- `npm run astro` — Run Astro CLI commands

**Linting & Formatting:**
- ESLint and Prettier are configured with lint-staged and Husky for code quality

---

## Project Scope

### Core Features
- User authentication (registration, login, password reset) with email and password
- User profile management (name, avatar, registration date)
- Project management (create, read, update, delete projects)
- Paginated and searchable project list
- PRD generation interface (guided by AI, iterative Q&A)
- Editable, AI-generated PRD documents
- In-app and email notifications

### Boundaries
- No project sharing between accounts
- No multimedia (e.g., images) support
- Web-only application (no mobile/native clients)

### Example User Stories
- Registration and login with validation
- Password reset via email
- Project CRUD operations
- Iterative PRD refinement with AI

For detailed requirements and user stories, see [`ai/prd.md`](./ai/prd.md).

---

## Project Status

> **Status:** In development

- Core features are being implemented
- See [issues](https://github.com/kkaliszczak-sembot/10x-project-manager/issues) for progress and roadmap

---

## License

This project is licensed under the [MIT License](./LICENSE). It is open source and provided without any warranty or liability. See the LICENSE file for details.

---

## Additional Resources
- [Product Requirements Document (PRD)](./ai/prd.md)
- [Tech Stack Overview](./ai/tech-stack.md)

---

*For questions or contributions, please open an issue or submit a pull request.*
