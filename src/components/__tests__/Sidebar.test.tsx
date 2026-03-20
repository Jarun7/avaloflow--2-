import { render, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

describe('Sidebar', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('New Automation')).toBeDefined();
  });
});
