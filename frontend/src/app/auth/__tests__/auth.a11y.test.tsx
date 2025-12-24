// src/app/auth/__tests__/auth.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, a11yTest, testMedicalFormAccessibility } from '@/test/setup-a11y';
import AuthPage from '../page';

// Mock the auth store
jest.mock('@/store/auth', () => ({
  useAuthStore: () => ({
    login: jest.fn(),
  }),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Auth Page Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<AuthPage />);
    await a11yTest(container);
  });

  it('should have proper form accessibility', async () => {
    const { container } = render(<AuthPage />);
    const form = container.querySelector('form');
    
    if (form) {
      await testMedicalFormAccessibility(form);
    }
  });

  it('should have proper heading structure', () => {
    const { getByRole } = render(<AuthPage />);
    
    // Should have main heading
    expect(getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should have proper form labels', () => {
    const { getByLabelText } = render(<AuthPage />);
    
    // Check for required form fields
    expect(getByLabelText(/email or phone number/i)).toBeInTheDocument();
    expect(getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should have proper error announcements', async () => {
    const { container } = render(<AuthPage />);
    
    // Check for error regions
    const errorRegions = container.querySelectorAll('[role="alert"]');
    errorRegions.forEach(region => {
      expect(region).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('should have minimum touch target sizes', () => {
    const { container } = render(<AuthPage />);
    
    // Check buttons meet minimum size requirements
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      expect(rect.height).toBeGreaterThanOrEqual(44);
    });
  });

  it('should support keyboard navigation', () => {
    const { container } = render(<AuthPage />);
    
    // Check that all interactive elements are focusable
    const interactiveElements = container.querySelectorAll(
      'button, input, select, textarea, a[href]'
    );
    
    interactiveElements.forEach(element => {
      expect(element).not.toHaveAttribute('tabindex', '-1');
    });
  });
});