import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleBadge } from '@/components/role-badge';
import { UserRole } from '@/types';

describe('RoleBadge', () => {
  it('renders owner role badge', () => {
    render(<RoleBadge role={UserRole.OWNER} />);
    expect(screen.getByText('Владелец')).toBeInTheDocument();
  });

  it('renders admin role badge', () => {
    render(<RoleBadge role={UserRole.ADMIN} />);
    expect(screen.getByText('Администратор')).toBeInTheDocument();
  });

  it('renders sales role badge', () => {
    render(<RoleBadge role={UserRole.SALES} />);
    expect(screen.getByText('Менеджер')).toBeInTheDocument();
  });

  it('renders consumer role badge', () => {
    render(<RoleBadge role={UserRole.CONSUMER} />);
    expect(screen.getByText('Потребитель')).toBeInTheDocument();
  });
});
