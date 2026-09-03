# ServiceDesk Frontend

A production-ready React + TypeScript frontend for the ServiceDesk ticket management system.

## 🎯 Features

- **Role-Based Access Control**: Support for Customer, Agent, and Admin roles
- **Authentication**: JWT-based authentication with secure token management
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Real-time Updates**: WebSocket support for live ticket updates
- **Comprehensive Dashboard**: Metrics and analytics for all user roles
- **Ticket Management**: Full CRUD operations for tickets
- **Advanced Filtering**: Search, filter, and sort tickets
- **Audit Logging**: Track all important actions
- **Accessibility**: WCAG 2.2 compliant UI

## 🏗️ Architecture

```
src/
├── components/         # Reusable components
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── ProtectedRoute.tsx
├── contexts/          # React contexts (Auth, etc.)
├── layouts/           # Layout components
├── pages/             # Page components
├── services/          # API client & utilities
├── types/             # TypeScript interfaces
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Tailwind CSS
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL (default: `http://localhost:3000`):
```
VITE_API_URL=http://localhost:3000
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

### Type Checking

Run TypeScript type checking:
```bash
npm run type-check
```

### Linting

Run ESLint:
```bash
npm run lint
```

## 📱 Pages & Routes

### Authentication Routes
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (All Roles)
- `/dashboard` - Main dashboard with metrics
- `/tickets` - Tickets list with filtering
- `/profile` - User profile

### Admin Routes
- `/users` - User management
- `/agents` - Agent management
- `/analytics` - Advanced analytics
- `/audit-logs` - Audit logs viewer
- `/settings` - System settings

### Agent Routes
- `/sla` - SLA information

## 🔐 Security Features

- JWT-based authentication
- Secure token storage in localStorage
- Automatic token refresh
- Protected routes with role-based access control
- Secure API client with interceptors
- Input validation with Zod/React Hook Form
- XSS protection through React's built-in sanitization

## 🎨 UI Components

### Built-in Tailwind Classes
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-danger` - Danger button
- `.btn-success` - Success button
- `.card` - Card container
- `.input` - Form input
- `.label` - Form label

## 📊 State Management

- **React Context API**: For authentication state
- **React Query**: For server state management
- **Zustand**: For client state management (if needed)

## 🌐 API Integration

The frontend communicates with the backend API through:
- Base URL: `http://localhost:3000` (configurable via `.env`)
- Endpoint prefix: `/api/v1`
- Authentication: Bearer token in Authorization header

### API Client Features
- Automatic token injection
- Global error handling
- 401 Unauthorized handling (redirect to login)
- Request/response logging

## ♿ Accessibility

- WCAG 2.2 Level AA compliant
- Keyboard navigation support
- Screen reader friendly
- Semantic HTML
- ARIA labels on interactive elements

## 🧪 Testing

Unit tests, integration tests, and E2E tests are coming soon.

```bash
# Run tests
npm run test

# Run E2E tests with Playwright
npm run test:e2e
```

## 📦 Dependencies

### Core
- **React 18.3**: UI library
- **React Router 6**: Client-side routing
- **TypeScript**: Type safety

### State & Data
- **TanStack Query 5**: Server state management
- **Zustand**: Client state management
- **React Hook Form**: Form handling

### UI & Styling
- **Tailwind CSS**: Utility-first CSS
- **Lucide React**: Icon library
- **Recharts**: Chart library

### Utilities
- **Axios**: HTTP client
- **Socket.io-client**: WebSocket client
- **Date-fns**: Date utilities
- **Zod**: Schema validation

## 🔧 Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:3000
```

### Build Configuration

Vite configuration is in `vite.config.ts`. Adjust as needed for your deployment.

## 📝 Coding Standards

- ESLint for code quality
- Prettier for code formatting
- TypeScript strict mode enabled
- Component-based architecture
- Separation of concerns

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel
```

### Deploy to Other Platforms
The `dist/` folder contains the production build ready to be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Railway
- Render

## 🐛 Troubleshooting

### Port Already in Use
Change the Vite dev port in `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3001,
  },
})
```

### CORS Errors
Ensure the backend API has CORS enabled or update the API URL in `.env`

### Token Expiration
The API client automatically handles 401 responses and redirects to login.

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 License

This project is part of the ServiceDesk application. All rights reserved.

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
