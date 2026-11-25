import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResponsiveTable } from './ResponsiveTable';

it('renders semantic table markup and phone cards', () => {
  render(<ResponsiveTable cards={[{ id: '1', title: 'Case PFA-001', details: [{ label: 'Status', value: 'Open' }], actions: <button>View</button> }]}><table><tbody><tr><td>Desktop row</td></tr></tbody></table></ResponsiveTable>);
  expect(screen.getByText('Desktop row')).toBeInTheDocument();
  expect(screen.getByText('Case PFA-001')).toBeInTheDocument();
  expect(screen.getByText('View')).toBeInTheDocument();
});
