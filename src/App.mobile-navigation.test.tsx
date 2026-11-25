import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MobileDrawer } from './App';

const renderDrawer = (role: 'Admin' | 'Doctor' | 'Data Entry', onClose = jest.fn()) => render(<MemoryRouter><MobileDrawer open user={{ id: 'u1', fullName: 'Asha', email: 'asha@example.test', role }} onClose={onClose} onLogout={jest.fn()} /></MemoryRouter>);

describe('mobile navigation', () => {
  it.each([
    ['Admin', ['Admin', 'Donations', 'Rescues']],
    ['Doctor', ['Rescues', 'Reports']],
    ['Data Entry', ['Declaration Form', 'Housekeeping']],
  ] as const)('shows only allowed items for %s', (role, labels) => {
    renderDrawer(role);
    labels.forEach(label => expect(screen.getByRole('link', { name: label })).toBeInTheDocument());
    if (role !== 'Admin') expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('closes on a navigation link, the backdrop, and Escape', () => {
    const onClose = jest.fn();
    renderDrawer('Admin', onClose);
    fireEvent.click(screen.getByText('Donations'));
    const afterLink = onClose.mock.calls.length;
    expect(afterLink).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByLabelText('Close navigation')[0]);
    expect(onClose.mock.calls.length).toBeGreaterThan(afterLink);
    const afterBackdrop = onClose.mock.calls.length;
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose.mock.calls.length).toBeGreaterThan(afterBackdrop);
  });
});
