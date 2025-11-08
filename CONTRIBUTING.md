# Contributing to English Flow

First off, thank you for considering contributing to English Flow! It's people like you that make English Flow such a great tool for language learning.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Coding Guidelines](#coding-guidelines)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Issue Reporting](#issue-reporting)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**When submitting a bug report, include:**
- **Clear title** - Descriptive and specific
- **Steps to reproduce** - Detailed steps to reproduce the issue
- **Expected behavior** - What you expected to happen
- **Actual behavior** - What actually happened
- **Screenshots** - If applicable
- **Environment** - OS, browser, Node version, etc.
- **Error messages** - Full error stack trace if available

**Example:**
```markdown
## Bug: Login fails with valid credentials

### Steps to Reproduce
1. Go to login page
2. Enter valid email: test@example.com
3. Enter valid password
4. Click "Login"

### Expected Behavior
User should be logged in and redirected to dashboard

### Actual Behavior
Error message: "Invalid credentials"

### Environment
- OS: Windows 11
- Browser: Chrome 119
- Node: v18.17.0

### Error Message
```
Error: Invalid token
  at authMiddleware (auth.ts:45)
```
```

---

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**When suggesting an enhancement, include:**
- **Clear title** - Describe the enhancement
- **Use case** - Why is this enhancement useful?
- **Proposed solution** - How would you implement it?
- **Alternatives** - Other solutions you've considered
- **Additional context** - Screenshots, mockups, etc.

---

### Contributing Code

We welcome code contributions! Here are the areas where you can help:

**Backend:**
- API endpoints
- Database optimizations
- Authentication improvements
- AI integrations
- Testing

**Frontend:**
- UI components
- Accessibility improvements
- Performance optimizations
- Mobile responsiveness
- PWA features

**Content:**
- English phrases
- Translations (Portuguese)
- Learning tips
- Category suggestions

**Documentation:**
- API documentation
- Code comments
- README improvements
- Tutorials

---

## Development Setup

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **PostgreSQL** 14.x or higher
- **Git**

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone YOUR fork
   git clone https://github.com/YOUR_USERNAME/AprendaInglesGratis.git
   cd AprendaInglesGratis
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ToyKids2025/AprendaInglesGratis.git
   ```

3. **Backend setup**
   ```bash
   cd backend
   npm install

   # Copy environment file
   cp .env.example .env

   # Edit .env with your credentials
   # Required: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # Seed database
   npm run prisma:seed

   # Start dev server
   npm run dev
   ```

4. **Frontend setup**
   ```bash
   cd frontend
   npm install

   # Start dev server
   npm run dev
   ```

5. **Verify setup**
   - Backend: http://localhost:3001/health
   - Frontend: http://localhost:5173

---

## Coding Guidelines

### General Principles

- **Write clean, readable code**
- **Follow existing patterns** in the codebase
- **Comment complex logic**
- **Keep functions small** (max 50 lines)
- **Use meaningful variable names**
- **Avoid code duplication** (DRY principle)

### TypeScript

**Type Safety:**
```typescript
// ✅ Good - Explicit types
interface User {
  id: string
  email: string
  name?: string
}

function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Bad - Using 'any'
function getUser(id: any): any {
  // ...
}
```

**Naming Conventions:**
```typescript
// Interfaces - PascalCase
interface UserProfile { }

// Types - PascalCase
type AuthToken = string

// Functions - camelCase
function getUserProfile() { }

// Constants - UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5

// Components - PascalCase
function UserCard() { }
```

### React/Frontend

**Component Structure:**
```typescript
// ✅ Good - Functional component with TypeScript
import React from 'react'

interface UserCardProps {
  user: User
  onEdit: (id: string) => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>
        Edit
      </button>
    </div>
  )
}
```

**Hooks:**
```typescript
// ✅ Good - Custom hooks with 'use' prefix
function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  // ...
  return { user, login, logout }
}

// Use hooks at top level
function MyComponent() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  // Don't use hooks conditionally
  if (user) {
    // ❌ Bad
    const something = useCustomHook()
  }
}
```

**Styling:**
```typescript
// Use Tailwind CSS classes
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click me
</button>

// For complex styling, extract to component
function PrimaryButton({ children, onClick }: ButtonProps) {
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
                 transition-colors duration-200 font-semibold"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### Backend/API

**Controller Pattern:**
```typescript
// ✅ Good - Async/await with proper error handling
export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        // Don't select password!
      },
    })

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      })
    }

    return res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return res.status(500).json({
      error: 'Internal server error',
    })
  }
}
```

**Database Queries:**
```typescript
// ✅ Good - Use Prisma's type-safe queries
const users = await prisma.user.findMany({
  where: {
    isPremium: true,
    createdAt: {
      gte: new Date('2024-01-01'),
    },
  },
  include: {
    progress: true,
  },
  orderBy: {
    xp: 'desc',
  },
  take: 10,
})

// ✅ Good - Use transactions for related operations
await prisma.$transaction(async (tx) => {
  await tx.user.update({
    where: { id: userId },
    data: { xp: { increment: 10 } },
  })

  await tx.achievement.create({
    data: {
      userId,
      type: 'first-lesson',
    },
  })
})
```

**Validation:**
```typescript
// ✅ Good - Use Zod for validation
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(2).max(100).optional(),
})

// Use in middleware
export function validateRegister(req: Request, res: Response, next: NextFunction) {
  try {
    registerSchema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      })
    }
    next(error)
  }
}
```

### File Organization

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   └── user.controller.ts
│   ├── routes/           # Route definitions
│   │   └── user.routes.ts
│   ├── middleware/       # Middleware functions
│   │   └── auth.ts
│   ├── services/         # Business logic
│   │   └── email.service.ts
│   ├── lib/             # Shared utilities
│   │   └── prisma.ts
│   └── server.ts        # App entry point

frontend/
├── src/
│   ├── pages/           # Page components
│   │   └── Dashboard.tsx
│   ├── components/      # Reusable components
│   │   └── UserCard.tsx
│   ├── services/        # API calls
│   │   └── api.ts
│   ├── store/          # State management
│   │   └── authStore.ts
│   └── utils/          # Helper functions
│       └── format.ts
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(lessons): correct XP calculation for streaks"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# Refactoring
git commit -m "refactor(user): extract profile logic to service"

# With body
git commit -m "feat(payment): integrate Stripe checkout

- Add checkout session creation
- Implement webhook handler
- Update user premium status on success"
```

### Branch Naming

- Feature: `feature/short-description`
- Bug fix: `fix/short-description`
- Hotfix: `hotfix/short-description`
- Documentation: `docs/short-description`

**Examples:**
```bash
git checkout -b feature/password-reset
git checkout -b fix/login-validation
git checkout -b docs/api-endpoints
```

---

## Pull Request Process

### Before Submitting

1. **Update from main**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   cd backend
   npm test
   ```

3. **Check linting**
   ```bash
   npm run lint
   ```

4. **Build successfully**
   ```bash
   npm run build
   ```

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] Tests added/updated (if needed)
- [ ] All tests pass
- [ ] No new warnings
- [ ] Commit messages follow guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests
- [ ] All tests pass
```

### Review Process

1. **Automated checks** - All CI checks must pass
2. **Code review** - At least one approval required
3. **Testing** - Changes tested in dev environment
4. **Merge** - Squash and merge to main

---

## Testing

### Backend Tests

**Unit Tests:**
```typescript
// user.controller.test.ts
import { getUser } from '../controllers/user.controller'

describe('User Controller', () => {
  it('should return user by id', async () => {
    const req = { params: { id: 'test-id' } }
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }

    await getUser(req as any, res as any)

    expect(res.json).toHaveBeenCalledWith({
      user: expect.objectContaining({
        id: 'test-id',
      }),
    })
  })

  it('should return 404 for non-existent user', async () => {
    const req = { params: { id: 'invalid-id' } }
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }

    await getUser(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(404)
  })
})
```

**Integration Tests:**
```typescript
// auth.integration.test.ts
import request from 'supertest'
import app from '../server'

describe('Auth Integration', () => {
  it('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'securePassword123',
        name: 'Test User',
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body.user.email).toBe('test@example.com')
  })
})
```

**Run Tests:**
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage

# Specific file
npm test -- user.controller.test.ts
```

### Frontend Tests

**Component Tests:**
```typescript
// UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { UserCard } from './UserCard'

describe('UserCard', () => {
  it('renders user information', () => {
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    }

    render(<UserCard user={user} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', () => {
    const user = { id: '1', name: 'John', email: 'john@example.com' }
    const onEdit = jest.fn()

    render(<UserCard user={user} onEdit={onEdit} />)

    fireEvent.click(screen.getByText('Edit'))

    expect(onEdit).toHaveBeenCalledWith('1')
  })
})
```

---

## Issue Reporting

### Bug Reports

Use the bug report template in GitHub Issues.

**Required Information:**
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/error messages

### Feature Requests

Use the feature request template in GitHub Issues.

**Required Information:**
- Problem description
- Proposed solution
- Alternatives considered
- Additional context

### Questions

For questions:
- Check existing issues first
- Search documentation
- Ask in GitHub Discussions
- Join our Discord community

---

## Development Workflow

### Typical Workflow

1. **Pick an issue**
   - Comment on the issue to let others know you're working on it
   - Get assignment from maintainers

2. **Create a branch**
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make changes**
   - Write code
   - Add tests
   - Update documentation

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

6. **Create pull request**
   - Fill out PR template
   - Link related issues
   - Request review

7. **Address feedback**
   - Make requested changes
   - Push updates
   - Re-request review

8. **Merge**
   - Maintainer will merge once approved

---

## Getting Help

**Resources:**
- [API Documentation](./docs/API.md)
- [Installation Guide](./INSTALL.md)
- [Roadmap](./ROADMAP_EXECUTIVO.md)

**Contact:**
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and general discussion
- Email: dev@englishflow.com
- Discord: discord.gg/englishflow

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor spotlight

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to English Flow! 🚀

Your contributions help thousands of people learn English more effectively and affordably.

**Happy coding!** 🎉
