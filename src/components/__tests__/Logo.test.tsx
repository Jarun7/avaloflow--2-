import { render, screen } from '@testing-library/react';
import { Logo } from '../Logo';
import { describe, it, expect } from 'vitest';

describe('Logo Component', () => {
  it('renders correctly', () => {
    render(<Logo />);
    expect(screen.getByText('Avaloflow')).toBeInTheDocument();
  });
});
