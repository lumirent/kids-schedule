import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('components/ui/Card', () => {
  it('renders content correctly', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeDefined();
  });

  it('applies variant classes correctly', () => {
    const { container } = render(<Card variant="glass">Glass Card</Card>);
    expect(container.firstChild).toHaveClass('glass');
  });

  it('allows custom className', () => {
    const { container } = render(<Card className="custom-class">Custom Card</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
