# BNI CRM Testing Guide

This project includes comprehensive automated tests using Vitest to ensure critical workflows function correctly and prevent regressions.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

### Critical Workflows Tested

1. **Referral Creation (`useReferrals.test.ts`)**
   - Creating new referrals
   - Fetching referrals given and received
   - Calculating Giver's Gain ratio
   - Calculating total business generated/received
   - Updating referral status

2. **Goal Management (`useGoals.test.ts`)**
   - Creating goals
   - Assigning team members to goals
   - Updating goal progress
   - Deleting goals
   - Fetching goals with assignments

3. **Introduction Matching (`IntroductionMatcher.test.tsx`)**
   - Finding contact matches based on needs/offerings
   - Displaying confidence levels
   - Sorting matches by confidence
   - Preventing self-matches
   - Limiting to top 10 matches

4. **Integration Tests (`bni-workflow.test.ts`)**
   - Complete referral creation workflow (referral → goal creation)
   - Goal assignment to team members
   - Network ROI metrics calculation
   - End-to-end BNI workflows

## Test Structure

```
src/test/
├── setup.ts                          # Test configuration & mocks
├── hooks/
│   ├── useReferrals.test.ts         # Referral hook tests
│   └── useGoals.test.ts              # Goals hook tests
├── components/
│   └── IntroductionMatcher.test.tsx  # Introduction matching tests
└── integration/
    └── bni-workflow.test.ts          # Full workflow integration tests
```

## Mocking Strategy

- **Supabase Client**: Mocked in `setup.ts` to prevent actual database calls
- **Toast Notifications**: Mocked to avoid UI side effects during tests
- **Authentication**: Test user ID (`test-user-id`) used consistently

## Writing New Tests

### Example: Testing a Hook

\`\`\`typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useYourHook } from '@/hooks/useYourHook';

describe('useYourHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    const { result } = renderHook(() => useYourHook());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
\`\`\`

### Example: Testing a Component

\`\`\`typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YourComponent } from '@/components/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
\`\`\`

## Coverage Goals

- **Hooks**: 80%+ coverage for business logic
- **Components**: 70%+ coverage for critical UI flows
- **Integration**: All major user workflows covered

## CI/CD Integration

Tests run automatically on:
- Pre-commit (recommended with husky)
- Pull requests
- Deployment pipeline

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clear Mocks**: Always clear mocks in `beforeEach`
3. **Async Handling**: Use `waitFor` for async operations
4. **Descriptive Names**: Test names should clearly describe what they test
5. **AAA Pattern**: Arrange, Act, Assert structure

## Troubleshooting

### Test Timeout
Increase timeout in `vitest.config.ts`:
\`\`\`typescript
test: {
  testTimeout: 10000
}
\`\`\`

### Mock Issues
Ensure mocks are defined in `setup.ts` before tests run.

### Type Errors
Check that `@types` packages are installed and `tsconfig.json` includes test files.

## Future Enhancements

- [ ] Add E2E tests with Playwright
- [ ] Increase coverage to 90%+
- [ ] Add performance benchmarks
- [ ] Implement snapshot testing for UI components
- [ ] Add mutation testing
