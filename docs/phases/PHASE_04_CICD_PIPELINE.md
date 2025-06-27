# Phase 4: CI/CD Pipeline

## Objective
Set up GitHub Actions workflow, implement automated testing, configure deployment automation, and manage environment secrets.

## Prerequisites
- Phase 3 completed (deployment configuration)
- GitHub repository set up
- Vercel account connected to GitHub

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: GitHub Actions Workflow (15 min)
- [ ] Create workflow configuration files
- [ ] Set up CI pipeline for pull requests
- [ ] Configure matrix builds for different Node versions
- [ ] Add workflow status badges

### Task 2: Automated Testing Setup (15 min)
- [ ] Set up unit testing with Jest/Vitest
- [ ] Configure end-to-end testing with Playwright
- [ ] Add linting and type checking to pipeline
- [ ] Set up test coverage reporting

### Task 3: Deployment Automation (15 min)
- [ ] Configure automatic deployment on main branch
- [ ] Set up preview deployments for pull requests
- [ ] Add deployment status checks
- [ ] Configure rollback mechanisms

### Task 4: Environment Secrets (15 min)
- [ ] Set up GitHub secrets for environment variables
- [ ] Configure Vercel integration secrets
- [ ] Add database credentials securely
- [ ] Test secret access in workflows

## Deliverables

### Main CI/CD Workflow (.github/workflows/ci-cd.yml)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: sqlite::memory:
    
    - name: Build project
      run: npm run build
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

  e2e-test:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    
    - name: Start application
      run: |
        npm run build
        npm run start &
        sleep 10
      env:
        DATABASE_URL: sqlite::memory:
        NODE_ENV: test
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload Playwright report
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Run security audit
      run: npm audit --audit-level=moderate
    
    - name: Run CodeQL Analysis
      uses: github/codeql-action/init@v2
      with:
        languages: javascript
    
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2

  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    needs: [test, e2e-test]
    if: github.event_name == 'pull_request'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Deploy to Vercel Preview
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        scope: ${{ secrets.VERCEL_ORG_ID }}
        working-directory: ./
    
    - name: Comment PR with preview URL
      uses: actions/github-script@v6
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: '🚀 Preview deployment is ready! Check it out at the Vercel deployment URL.'
          })

  deploy-production:
    name: Deploy Production
    runs-on: ubuntu-latest
    needs: [test, e2e-test, security-scan]
    if: github.ref == 'refs/heads/main'
    
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Deploy to Vercel Production
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
        scope: ${{ secrets.VERCEL_ORG_ID }}
        working-directory: ./
    
    - name: Run database migrations
      run: npm run migrate
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
    
    - name: Notify deployment success
      uses: 8398a7/action-slack@v3
      if: success()
      with:
        status: success
        text: '🎉 Production deployment successful!'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Testing Configuration

#### Jest Configuration (jest.config.js)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server/src', '<rootDir>/client/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'server/src/**/*.ts',
    'client/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  }
}
```

#### Playwright Configuration (playwright.config.ts)
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'sqlite::memory:'
    }
  },
})
```

#### Sample E2E Test (e2e/room-creation.spec.ts)
```typescript
import { test, expect } from '@playwright/test'

test.describe('Room Creation', () => {
  test('should create a new room and join it', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')
    
    // Click create room button
    await page.click('text=Create New Room')
    
    // Fill in room name
    await page.fill('input[placeholder="Enter room name..."]', 'Test Room')
    
    // Create room
    await page.click('button[type="submit"]')
    
    // Should redirect to room page
    await expect(page).toHaveURL(/\/room\/\w+/)
    
    // Join room modal should appear
    await expect(page.locator('text=Join Room')).toBeVisible()
    
    // Enter user name
    await page.fill('input[placeholder="Enter your name..."]', 'Test User')
    await page.click('button:has-text("Join Room")')
    
    // Should see room interface
    await expect(page.locator('text=Test Room')).toBeVisible()
    await expect(page.locator('text=Test User')).toBeVisible()
  })
  
  test('should allow voting and revealing', async ({ page, context }) => {
    // Create room and join as first user
    await page.goto('/create')
    await page.fill('input[placeholder="Enter room name..."]', 'Voting Test')
    await page.click('button[type="submit"]')
    
    await page.fill('input[placeholder="Enter your name..."]', 'User 1')
    await page.click('button:has-text("Join Room")')
    
    // Open second browser context for second user
    const page2 = await context.newPage()
    await page2.goto(page.url())
    await page2.fill('input[placeholder="Enter your name..."]', 'User 2')
    await page2.click('button:has-text("Join Room")')
    
    // Both users vote
    await page.click('[data-testid="vote-card-5"]')
    await page2.click('[data-testid="vote-card-5"]')
    
    // Reveal votes
    await page.click('button:has-text("Reveal Cards")')
    
    // Check for unanimous result
    await expect(page.locator('text=Unanimous!')).toBeVisible()
    await expect(page2.locator('text=Unanimous!')).toBeVisible()
  })
})
```

### Linting Configuration

#### ESLint Configuration (.eslintrc.js)
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
```

### Package.json Test Scripts
```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### GitHub Secrets Configuration

Required secrets in GitHub repository settings:

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-vercel-org-id>
VERCEL_PROJECT_ID=<your-vercel-project-id>
DATABASE_URL=<production-database-url>
SLACK_WEBHOOK_URL=<optional-slack-webhook>
CODECOV_TOKEN=<optional-codecov-token>
```

### Status Badges (README.md)
```markdown
# Planning Poker

[![CI/CD Pipeline](https://github.com/username/repo/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/username/repo/actions)
[![codecov](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repo)
[![Deployment](https://img.shields.io/github/deployments/username/repo/production?label=deployment)](https://github.com/username/repo/deployments)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

## Success Criteria
- [ ] GitHub Actions workflow runs successfully
- [ ] All tests pass in CI environment
- [ ] Automatic deployment works on main branch push
- [ ] Preview deployments work for pull requests
- [ ] Security scanning identifies and reports issues
- [ ] Environment secrets are properly configured
- [ ] Deployment status is properly reported

## Common Issues & Solutions

### Issue: Tests failing in CI but passing locally
**Solution**: Check environment differences, ensure consistent Node versions

### Issue: Vercel deployment failing
**Solution**: Verify secrets are set correctly, check build logs

### Issue: E2E tests timing out
**Solution**: Increase timeouts, ensure application starts properly

## Testing Checklist
- [ ] CI workflow triggers on push and PR
- [ ] All test suites run successfully
- [ ] Linting and type checking pass
- [ ] Security scans complete without critical issues
- [ ] Preview deployments create successfully
- [ ] Production deployments work on main branch
- [ ] Database migrations run in production
- [ ] Status badges update correctly

## Next Steps
After completion, proceed to **Phase 5: Database Schema & Models** to implement the data layer.

## Time Tracking
- Start Time: ___________
- End Time: ___________
- Actual Duration: ___________
- Notes: ___________

## Dependencies
- **Blocks**: Phase 5 (Database Schema & Models)
- **Blocked by**: Phase 3 (Deployment Configuration)