import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleBadge } from '@/components/role-badge';
import { UserRole } from '@/types';

describe('RoleBadge', () => {
  it('renders owner role badge', () => {
    render(<RoleBadge role={UserRole.OWNER} />);
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('renders admin role badge', () => {
    render(<RoleBadge role={UserRole.ADMIN} />);
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('renders sales role badge', () => {
    render(<RoleBadge role={UserRole.SALES} />);
    expect(screen.getByText('Sales Manager')).toBeInTheDocument();
  });

  it('renders consumer role badge', () => {
    render(<RoleBadge role={UserRole.CONSUMER} />);
    expect(screen.getByText('Consumer')).toBeInTheDocument();
  });
});
