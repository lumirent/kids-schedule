import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Select } from './Input';

describe('components/ui/Input', () => {
  describe('Input', () => {
    it('renders placeholder correctly', () => {
      render(<Input placeholder="Enter name" />);
      expect(screen.getByPlaceholderText('Enter name')).toBeDefined();
    });

    it('handles onChange events', () => {
      const handleChange = vi.fn();
      render(<Input placeholder="Enter name" onChange={handleChange} />);
      const input = screen.getByPlaceholderText('Enter name');
      fireEvent.change(input, { target: { value: 'New Value' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('renders with icon', () => {
      render(<Input placeholder="With icon" icon={<span data-testid="icon">icon</span>} />);
      expect(screen.getByTestId('icon')).toBeDefined();
    });
  });

  describe('Select', () => {
    it('renders options correctly', () => {
      render(
        <Select label="My Select">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      );
      expect(screen.getByText('My Select')).toBeDefined();
      expect(screen.getByText('Option 1')).toBeDefined();
      expect(screen.getByText('Option 2')).toBeDefined();
    });

    it('handles value change', () => {
      const handleChange = vi.fn();
      render(
        <Select onChange={handleChange} defaultValue="1">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      );
      const select = screen.getByDisplayValue('Option 1');
      fireEvent.change(select, { target: { value: '2' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
