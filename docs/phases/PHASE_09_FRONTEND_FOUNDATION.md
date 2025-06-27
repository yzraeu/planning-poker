# Phase 7: Frontend Foundation

## Objective
Set up React application with Vite, configure Tailwind CSS, implement routing, and create the basic layout structure.

## Prerequisites
- Phase 1 completed (project setup)
- Node.js and npm working
- Basic understanding of React and Vite

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: Set up React with Vite (15 min)
- [ ] Initialize Vite React TypeScript project in client directory
- [ ] Configure Vite build settings and dev server
- [ ] Set up basic App component structure
- [ ] Test development server startup

### Task 2: Configure Tailwind CSS (15 min)
- [ ] Install and configure Tailwind CSS
- [ ] Set up Tailwind configuration file
- [ ] Add Tailwind directives to CSS
- [ ] Test utility classes are working

### Task 3: Set up Routing (15 min)
- [ ] Install React Router DOM
- [ ] Create route structure for home, room creation, and room pages
- [ ] Set up protected routes and navigation
- [ ] Test routing between pages

### Task 4: Create Basic Layout (15 min)
- [ ] Design and implement main layout component
- [ ] Create header with branding and navigation
- [ ] Set up responsive container structure
- [ ] Add basic styling and theme colors

## Deliverables

### Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Navigation.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Input.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── CreateRoom.tsx
│   │   └── Room.tsx
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

### Vite Configuration (client/vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

### App Component (client/src/App.tsx)
```typescript
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import CreateRoom from './pages/CreateRoom'
import Room from './pages/Room'
import './index.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path=\"/\" element={<Home />} />
          <Route path=\"/create\" element={<CreateRoom />} />
          <Route path=\"/room/:roomId\" element={<Room />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
```

### Layout Component (client/src/components/layout/Layout.tsx)
```typescript
import React from 'react'
import Header from './Header'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className=\"min-h-screen bg-gray-50\">
      <Header />
      <main className=\"container mx-auto px-4 py-8\">
        {children}
      </main>
    </div>
  )
}

export default Layout
```

### Header Component (client/src/components/layout/Header.tsx)
```typescript
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header: React.FC = () => {
  const location = useLocation()
  
  return (
    <header className=\"bg-white shadow-sm border-b\">
      <div className=\"container mx-auto px-4\">
        <div className=\"flex items-center justify-between h-16\">
          <Link to=\"/\" className=\"flex items-center space-x-2\">
            <div className=\"w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center\">
              <span className=\"text-white font-bold text-lg\">P</span>
            </div>
            <span className=\"text-xl font-semibold text-gray-900\">
              Planning Poker
            </span>
          </Link>
          
          <nav className=\"flex items-center space-x-4\">
            {location.pathname !== '/' && (
              <Link
                to=\"/\"
                className=\"text-gray-600 hover:text-gray-900 transition-colors\"
              >
                Home
              </Link>
            )}
            {location.pathname !== '/create' && (
              <Link
                to=\"/create\"
                className=\"bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors\"
              >
                Create Room
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
```

### Basic UI Components

#### Button Component (client/src/components/ui/Button.tsx)
```typescript
import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
```

### Home Page (client/src/pages/Home.tsx)
```typescript
import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

const Home: React.FC = () => {
  return (
    <div className=\"text-center py-12\">
      <div className=\"max-w-3xl mx-auto\">
        <h1 className=\"text-4xl font-bold text-gray-900 mb-6\">
          Planning Poker
        </h1>
        <p className=\"text-xl text-gray-600 mb-8\">
          Collaborative estimation tool for agile teams. 
          Create a room, invite your team, and start voting on story points.
        </p>
        
        <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">
          <Link to=\"/create\">
            <Button size=\"lg\" className=\"w-full sm:w-auto\">
              Create New Room
            </Button>
          </Link>
          <Button variant=\"outline\" size=\"lg\" className=\"w-full sm:w-auto\">
            Join Existing Room
          </Button>
        </div>
        
        <div className=\"mt-16 grid grid-cols-1 md:grid-cols-3 gap-8\">
          <div className=\"text-center\">
            <div className=\"w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4\">
              <span className=\"text-blue-600 text-xl\">🏠</span>
            </div>
            <h3 className=\"text-lg font-semibold mb-2\">Create Rooms</h3>
            <p className=\"text-gray-600\">
              Create unlimited rooms with unique URLs that never expire
            </p>
          </div>
          
          <div className=\"text-center\">
            <div className=\"w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4\">
              <span className=\"text-green-600 text-xl\">🗳️</span>
            </div>
            <h3 className=\"text-lg font-semibold mb-2\">Vote Together</h3>
            <p className=\"text-gray-600\">
              Use Fibonacci sequence or special cards for estimation
            </p>
          </div>
          
          <div className=\"text-center\">
            <div className=\"w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4\">
              <span className=\"text-purple-600 text-xl\">🎉</span>
            </div>
            <h3 className=\"text-lg font-semibold mb-2\">Celebrate</h3>
            <p className=\"text-gray-600\">
              Get confetti when your team reaches unanimous consensus
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
```

### Tailwind Configuration (client/tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    \"./index.html\",
    \"./src/**/*.{js,ts,jsx,tsx}\",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
```

### Package.json Dependencies
```json
{
  \"dependencies\": {
    \"react\": \"^18.2.0\",
    \"react-dom\": \"^18.2.0\",
    \"react-router-dom\": \"^6.8.0\",
    \"clsx\": \"^1.2.1\"
  },
  \"devDependencies\": {
    \"@types/react\": \"^18.0.27\",
    \"@types/react-dom\": \"^18.0.10\",
    \"@vitejs/plugin-react\": \"^3.1.0\",
    \"autoprefixer\": \"^10.4.13\",
    \"postcss\": \"^8.4.21\",
    \"tailwindcss\": \"^3.2.6\",
    \"typescript\": \"^4.9.3\",
    \"vite\": \"^4.1.0\"
  }
}
```

## Success Criteria
- [ ] Vite development server starts without errors
- [ ] React application loads and displays home page
- [ ] Tailwind CSS classes are applied correctly
- [ ] Routing works between home, create, and room pages
- [ ] Header navigation functions properly
- [ ] Layout is responsive on different screen sizes
- [ ] TypeScript compilation works without errors

## Common Issues & Solutions

### Issue: Tailwind classes not applying
**Solution**: Ensure Tailwind directives are in index.css and build process includes CSS

### Issue: Routing not working
**Solution**: Check BrowserRouter setup and ensure routes are properly nested

### Issue: Import path errors
**Solution**: Configure path aliases in vite.config.ts and tsconfig.json

## Testing Checklist
- [ ] `npm run dev` starts development server
- [ ] Home page loads with correct content
- [ ] Navigation links work correctly
- [ ] Responsive design works on mobile/desktop
- [ ] Tailwind utilities apply styling correctly
- [ ] TypeScript compilation is error-free
- [ ] Browser console shows no errors

## Next Steps
After completion, proceed to **Phase 8: Room UI Components** to create room creation/joining interface.

## Time Tracking
- Start Time: ___________
- End Time: ___________
- Actual Duration: ___________
- Notes: ___________

## Dependencies
- **Blocks**: All remaining frontend phases (8-12)
- **Blocked by**: Phase 1 (Project Setup)