// src/test/setup-a11y.ts
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Configure axe for healthcare accessibility standards
const axe = configureAxe({
  rules: {
    // Ensure color contrast meets WCAG AA standards
    'color-contrast': { enabled: true },
    
    // Ensure all images have alt text (critical for medical images)
    'image-alt': { enabled: true },
    
    // Ensure form labels are properly associated
    'label': { enabled: true },
    
    // Ensure keyboard navigation works
    'keyboard': { enabled: true },
    
    // Ensure focus is visible
    'focus-order-semantics': { enabled: true },
    
    // Ensure ARIA is used correctly
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-required-attr': { enabled: true },
    
    // Ensure semantic HTML is used
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    
    // Healthcare-specific rules
    'bypass': { enabled: true }, // Skip links for screen readers
    'document-title': { enabled: true }, // Page titles for context
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
});

export { axe };

// Global test utilities for accessibility
export const a11yTest = async (component: any) => {
  const results = await axe(component);
  expect(results).toHaveNoViolations();
};

// Healthcare-specific accessibility test helpers
export const testMedicalFormAccessibility = async (form: HTMLElement) => {
  // Test form accessibility
  const results = await axe(form, {
    rules: {
      'label': { enabled: true },
      'color-contrast': { enabled: true },
      'keyboard': { enabled: true },
    },
  });
  expect(results).toHaveNoViolations();
};

export const testEmergencyButtonAccessibility = async (button: HTMLElement) => {
  // Test emergency button accessibility (higher standards)
  const results = await axe(button, {
    rules: {
      'color-contrast': { enabled: true },
      'keyboard': { enabled: true },
      'focus-order-semantics': { enabled: true },
    },
  });
  expect(results).toHaveNoViolations();
  
  // Ensure minimum touch target size
  const rect = button.getBoundingClientRect();
  expect(rect.width).toBeGreaterThanOrEqual(44);
  expect(rect.height).toBeGreaterThanOrEqual(44);
};