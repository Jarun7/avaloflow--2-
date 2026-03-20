import { render, screen } from '@testing-library/react';
import { TopBar } from '../TopBar';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

describe('TopBar', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <TopBar />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText('Search data...')).toBeDefined();
    expect(screen.getByText('Launch')).toBeDefined();
  });
});
