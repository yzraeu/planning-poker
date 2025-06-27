# Phase 1: Project Setup & Tooling

## Objective
Set up the foundational project structure, development tools, and configuration files for a monorepo-based planning poker application.

## Prerequisites
- Node.js 18+ installed
- Git repository initialized
- Code editor (VS Code recommended)

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: Initialize Monorepo Structure (15 min)
- [x] Create `client/` directory for React frontend
- [x] Create `server/` directory for Node.js backend  
- [x] Create `shared/` directory for common types
- [x] Create root `package.json` with workspace configuration

### Task 2: Set up Package.json Files (15 min)
- [x] Configure root `package.json` with npm workspaces
- [x] Create `client/package.json` with React dependencies
- [x] Create `server/package.json` with Express dependencies
- [x] Add development scripts for concurrent running

### Task 3: Configure TypeScript (15 min)
- [x] Install TypeScript and @types packages
- [x] Create `tsconfig.json` in root directory
- [x] Create `client/tsconfig.json` extending root config
- [x] Create `server/tsconfig.json` extending root config

### Task 4: Set up Development Scripts (15 min)
- [x] Install `concurrently` for running multiple processes
- [x] Add `dev` script to run client and server together
- [x] Add `build` script for production builds
- [x] Test all scripts work correctly

## Deliverables

### File Structure Created
```
/
├── client/
│   ├── package.json
│   └── tsconfig.json
├── server/
│   ├── package.json
│   └── tsconfig.json
├── shared/
│   └── types/
├── package.json (root)
├── tsconfig.json (root)
└── .gitignore
```

### Root package.json
```json
{
  "name": "conexiom-poker",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "npm run dev --workspace=client",
    "dev:server": "npm run dev --workspace=server",
    "build": "npm run build --workspace=client && npm run build --workspace=server"
  }
}
```

### Dependencies Installed
- **Root**: `concurrently`, `typescript`, `@types/node`
- **Client**: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`
- **Server**: `express`, `socket.io`, `cors`, `@types/express`

## Success Criteria
- [x] All directories and files created successfully
- [x] `npm install` runs without errors from root
- [x] TypeScript compiles without errors
- [x] `npm run dev` starts both client and server (even if they show placeholder content)

## Common Issues & Solutions

### Issue: npm workspace errors
**Solution**: Ensure package.json files exist in client/server before running npm install

### Issue: TypeScript path resolution
**Solution**: Use relative imports initially, configure path mapping later

### Issue: Port conflicts
**Solution**: Use different ports (client: 5173, server: 3001)

## Next Steps
After completion, proceed to **Phase 2: Backend Foundation** where we'll set up Express server and Socket.io integration.

## Time Tracking
- Start Time: 2025-06-27 17:20 UTC
- End Time: 2025-06-27 18:30 UTC
- Actual Duration: ~1 hour 10 minutes
- Notes: Successfully restructured from SvelteKit to React+Express monorepo as specified. All requirements met.

## Dependencies
- **Blocks**: All subsequent phases depend on this setup
- **Blocked by**: None (first phase)