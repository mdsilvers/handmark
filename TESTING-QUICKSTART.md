# Testing Quick Start Guide

## Installation

### Frontend
```bash
cd frontend
npm install
npx playwright install
```

### Backend
```bash
cd backend
pip install -r requirements.txt
```

## Running Tests

### Frontend Unit Tests
```bash
cd frontend
npm test                 # Run once
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

### Frontend E2E Tests
```bash
cd frontend
npm run test:e2e         # Headless
npm run test:e2e:headed  # With browser UI
npm run test:e2e:ui      # Playwright UI mode
```

### Backend Tests
```bash
cd backend
pytest                          # Run all tests
pytest tests/unit              # Unit tests only
pytest tests/integration       # Integration tests only
pytest --cov=app --cov-report=html  # With coverage
```

## CI/CD

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

View results in GitHub Actions tab.

## Coverage Reports

### Frontend
- Terminal: After running `npm run test:coverage`
- HTML: `frontend/coverage/lcov-report/index.html`
- CI: Uploaded to Codecov automatically

### Backend
- Terminal: After running `pytest --cov`
- HTML: `backend/htmlcov/index.html`
- CI: Uploaded to Codecov automatically

## File Locations

### Test Files
- **Frontend unit tests:** `frontend/src/__tests__/`
- **Frontend E2E tests:** `frontend/e2e/`
- **Backend tests:** `backend/tests/`

### Configuration
- **Jest:** `frontend/jest.config.js`
- **Playwright:** `frontend/playwright.config.ts`
- **pytest:** `backend/pytest.ini`

### Documentation
- **Test Plan:** `docs/TEST-PLAN.md`
- **QA Checklist:** `docs/QA-CHECKLIST.md`
- **QA Report:** `QA-REPORT.md`

## Quick Debugging

### Frontend Test Failing?
```bash
npm test -- --verbose
npm test -- --watch <test-file>
```

### E2E Test Failing?
```bash
npm run test:e2e:headed           # See the browser
npm run test:e2e:ui                # Use Playwright UI
npx playwright show-report        # View HTML report
```

### Backend Test Failing?
```bash
pytest -v tests/path/to/test.py   # Verbose mode
pytest -s tests/path/to/test.py   # Show print statements
pytest --pdb                        # Drop into debugger on failure
```

## Common Issues

**"Module not found" in Jest:**
- Check `jest.config.js` moduleNameMapper
- Verify imports use `@/` prefix for src files

**Playwright browser not found:**
```bash
npx playwright install
```

**Backend tests can't connect to database:**
- Check `DATABASE_URL` in environment
- Tests use SQLite in-memory by default

**Coverage too low:**
- Check `jest.config.js` or `pytest.ini` for thresholds
- Run coverage report to see uncovered lines
- Add tests for uncovered code

## Best Practices

1. **Write tests as you code** - Don't wait until the end
2. **Follow AAA pattern** - Arrange, Act, Assert
3. **Use descriptive test names** - `test_should_validate_email_format`
4. **Mock external dependencies** - Supabase, APIs, etc.
5. **Test edge cases** - Empty, null, invalid, max values
6. **Keep tests fast** - Unit tests should run in milliseconds
7. **Use fixtures** - Reuse common test data
8. **Test user behavior** - Not implementation details

## Next Steps

1. Install dependencies (see above)
2. Run existing tests to verify setup
3. Add tests as you implement features
4. Monitor coverage and maintain 80%+ threshold
5. Review QA checklist before releases

---

**Need help?** Check the full documentation in `docs/TEST-PLAN.md`
