# PTU Notice Board

A modern, responsive notice board application built with React, TypeScript, and Tailwind CSS.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Docker Setup](#docker-setup)
- [Component Structure](#component-structure)
- [Cloud Deployment](#cloud-deployment)
- [Environment Variables](#environment-variables)

## Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [VS Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)

### Recommended VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- GitLens
- Docker

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ptu-notice-board.git
cd ptu-notice-board
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
JWT_SECRET=s3cReT@987!gHfJ8$1g

```

4. Start the development server:
```bash
# Start frontend
npm run dev

# Start backend (in a new terminal)
npm run server
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

Make sure to add your logo file as ptu-logo.png in the public folder of your project.

### VS Code Setup

1. Open the project in VS Code:
```bash
code .
```

2. Install recommended extensions when prompted

3. Configure VS Code settings for the project (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Development Workflow

1. Start the development servers:
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server
```

2. Access the application:
- Frontend: `http://localhost:5173`
- API Documentation: `http://localhost:3000/api-docs`

3. Available Scripts:
```bash
npm run dev          # Start frontend development server
npm run server      # Start backend server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run test        # Run tests
npm run type-check  # Run TypeScript type checking
```

### Project Structure
```
ptu-notice-board/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Root component
│   └── main.tsx       # Entry point
├── server/
│   ├── routes/        # API routes
│   ├── middleware/    # Express middleware
│   ├── db/           # Database setup
│   └── index.ts      # Server entry point
├── public/           # Static assets
└── prisma/          # Database schema
```

## Docker Setup

### Using Docker Compose (Recommended)

1. Start the application:
```bash
docker-compose up
```

2. Stop the application:
```bash
docker-compose down
```

### Using Docker

1. Build the image:
```bash
docker build -t ptu-notice-board .
```

2. Run the container:
```bash
docker run -p 5173:5173 -p 3000:3000 ptu-notice-board
```

[Rest of the README content remains as is...]