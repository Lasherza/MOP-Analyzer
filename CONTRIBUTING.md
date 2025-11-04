# Contributing to Telco MOP Analysis Agent

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Python 3.8+ (for sample generation)
- Git

### Setup

1. Fork the repository on GitHub
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/telco-mop-agent.git
cd telco-mop-agent
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/telco-mop-agent.git
```

4. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

5. Set up environment:
```bash
# Backend
cd backend
cp .env.development .env
# Edit .env and set X_API_KEY

# Frontend
cd ../frontend
cp .env.development .env
```

6. Generate sample files:
```bash
cd samples
pip install -r requirements.txt
python generate_samples.py
```

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/my-new-feature
```

### Running Locally

**Backend** (port 3000):
```bash
cd backend
npm run dev
```

**Frontend** (port 5173):
```bash
cd frontend
npm run dev
```

**Full stack with Docker**:
```bash
docker-compose up
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define proper types, avoid `any`
- Use meaningful variable names
- Document complex functions with JSDoc

**Example**:
```typescript
/**
 * Calculate weighted score for MOP section
 * @param checks - Array of check results
 * @param weights - Weight configuration
 * @returns Calculated score (0-10)
 */
function calculateScore(checks: Check[], weights: Weights): number {
  // Implementation
}
```

### JavaScript/React

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for props
- Follow React best practices

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line length**: Max 100 characters
- **Naming**:
  - Variables/functions: `camelCase`
  - Classes/Types: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`

### Linting

Run linters before committing:

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Testing

### Writing Tests

- **Unit tests**: Test individual functions/classes
- **Integration tests**: Test API endpoints
- **Coverage**: Aim for >70% coverage

**Test file naming**: `*.test.ts` or `*.spec.ts`

### Running Tests

```bash
# Backend unit tests
cd backend
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

### Test Structure

```typescript
describe('ScoringEngine', () => {
  let engine: ScoringEngine;

  beforeEach(() => {
    engine = new ScoringEngine();
  });

  describe('scorePreChecks', () => {
    it('should return 0 when section is null', () => {
      const result = engine.scorePreChecks(null, []);
      expect(result.score).toBe(0);
    });

    it('should score complete section highly', () => {
      const section = createMockSection();
      const result = engine.scorePreChecks(section, []);
      expect(result.score).toBeGreaterThan(7);
    });
  });
});
```

## Submitting Changes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build/tooling

**Examples**:
```
feat(scoring): add network latency checks to IPCORE category

fix(parser): handle MOPs with missing section headings

docs(readme): update ITIL4 mapping table
```

### Pull Request Process

1. **Update from upstream**:
```bash
git checkout develop
git pull upstream develop
git checkout feature/my-feature
git rebase develop
```

2. **Run tests and linting**:
```bash
npm test
npm run lint
```

3. **Push to your fork**:
```bash
git push origin feature/my-feature
```

4. **Create Pull Request** on GitHub:
   - Base: `develop`
   - Compare: `your-fork:feature/my-feature`
   - Title: Clear, descriptive
   - Description: What, why, how

5. **PR Checklist**:
   - [ ] Tests pass (`npm test`)
   - [ ] Linting passes (`npm run lint`)
   - [ ] Code coverage maintained/improved
   - [ ] Documentation updated (if needed)
   - [ ] Changelog updated (for features/fixes)
   - [ ] No merge conflicts with `develop`

### Code Review

- Respond to review comments promptly
- Make requested changes
- Update PR description if scope changes
- Squash commits if requested

## Areas for Contribution

### High Priority

- [ ] Additional ITIL4 checks for scoring engine
- [ ] Support for more document formats (PDF, Word 97-2003)
- [ ] Performance optimizations for large files
- [ ] Enhanced Tavily integration with more sources

### Documentation

- [ ] Video tutorials
- [ ] Category-specific best practice guides
- [ ] Deployment guides for cloud platforms
- [ ] API client libraries (Python, Go, etc.)

### Testing

- [ ] E2E tests with Playwright/Cypress
- [ ] Load testing with k6
- [ ] Security testing

### Features

- [ ] Multi-language support (i18n)
- [ ] User authentication and RBAC
- [ ] Analytics dashboard
- [ ] Scheduled/batch analysis
- [ ] Email notifications

## Questions?

- Open a [GitHub Discussion](https://github.com/OWNER/telco-mop-agent/discussions)
- Check existing [Issues](https://github.com/OWNER/telco-mop-agent/issues)
- Read the [Documentation](docs/)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
