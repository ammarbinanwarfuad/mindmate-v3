# Contributing to MindMate

Thank you for considering contributing to MindMate! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize user privacy and data security
- Remember this project impacts mental health - handle with care

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Component Guidelines

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components under 200 lines when possible
- Use TypeScript interfaces for props

### API Guidelines

- Always validate input with Zod schemas
- Return consistent error responses
- Handle errors gracefully
- Add appropriate status codes
- Document API changes

### Security

- Never commit sensitive data
- Always validate and sanitize user input
- Use parameterized database queries
- Follow OWASP guidelines
- Report security issues privately

### Testing

- Write tests for new features
- Maintain or improve code coverage
- Test edge cases
- Include integration tests for APIs

## Pull Request Process

1. Update README if needed
2. Add/update tests
3. Ensure all tests pass
4. Update documentation
5. Request review from maintainers
6. Address review feedback
7. Squash commits if requested

## Commit Messages

Use conventional commits format:

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `style: format code`
- `refactor: restructure code`
- `test: add tests`
- `chore: update dependencies`

## Priority Areas

We especially welcome contributions in:

- Accessibility improvements
- Mobile responsiveness
- Performance optimizations
- Test coverage
- Documentation
- Crisis detection accuracy
- Internationalization

## Questions?

Open an issue for questions or discussions.

Thank you for contributing to mental wellness! 💙

