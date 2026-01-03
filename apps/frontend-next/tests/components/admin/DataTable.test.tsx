import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '@/components/admin/DataTable';

interface TestRow {
  id: string;
  name: string;
  email: string;
}

describe('DataTable', () => {
  const mockColumns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
  ];

  const mockData: TestRow[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
  ];

  it('renders table headers from columns config', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders data rows with correct cell content', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('shows "Loading..." when isLoading is true', () => {
    render(<DataTable columns={mockColumns} data={[]} isLoading={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows default "No data available" when data is empty', () => {
    render(<DataTable columns={mockColumns} data={[]} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('shows custom emptyMessage when data is empty', () => {
    render(<DataTable columns={mockColumns} data={[]} emptyMessage="No users found" />);

    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('calls onRowClick with row data when row is clicked', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={mockColumns} data={mockData} onRowClick={onRowClick} />);

    fireEvent.click(screen.getByText('Alice'));

    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('applies cursor-pointer class when onRowClick is provided', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={mockColumns} data={mockData} onRowClick={onRowClick} />);

    const row = screen.getByText('Alice').closest('tr');
    expect(row).toHaveClass('cursor-pointer');
  });

  it('does not apply cursor-pointer class when onRowClick is not provided', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const row = screen.getByText('Alice').closest('tr');
    expect(row).not.toHaveClass('cursor-pointer');
  });

  it('uses custom render function for cell content when provided', () => {
    const columnsWithRender = [
      {
        key: 'name',
        header: 'Name',
        render: (row: TestRow) => <strong data-testid="custom-render">{row.name}</strong>,
      },
      { key: 'email', header: 'Email' },
    ];

    render(<DataTable columns={columnsWithRender} data={mockData} />);

    const customElements = screen.getAllByTestId('custom-render');
    expect(customElements.length).toBe(2); // One for each row
    expect(customElements[0]).toHaveTextContent('Alice');
  });
});
