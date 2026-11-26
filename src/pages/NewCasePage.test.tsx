import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewCasePage from './NewCasePage';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { mockAppContext } from '../test/mocks';

// Mocking storage helpers
jest.mock('../lib/storage', () => ({
  uploadFile: jest.fn().mockResolvedValue('http://mockurl.com/image.jpg'),
  base64ToFile: jest.fn(),
}));

const mockAddCase = jest.fn();

// Mocking the context
jest.mock('../context/AppContext', () => ({
  useAppContext: () => ({
    ...mockAppContext,
    addCase: mockAddCase,
    isLoading: false,
  }),
}));

const renderNewCase = () => {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<NewCasePage />} />
        <Route path="/cases" element={<div>Cases List Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('NewCasePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddCase.mockResolvedValue({ id: 'saved-case' });
    window.alert = jest.fn();
    localStorage.setItem('pfa_user_session', JSON.stringify({ id: 'user-1', role: 'Admin' }));
  });

  it('initially renders selection view and transitions to Domestic form', () => {
    renderNewCase();
    expect(screen.getByText(/Select Category/i)).toBeInTheDocument();
    
    // Use role to disambiguate from the description paragraph
    const domesticBtn = screen.getByRole('heading', { name: /^Domestic$/i }).closest('button');
    fireEvent.click(domesticBtn!);
    
    expect(screen.getByText(/New Domestic Case/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Case Number \*/i)).toBeInTheDocument();
  });

  it('keeps submit unavailable until all required intake fields are complete', async () => {
    renderNewCase();
    // Transition to form
    const domesticBtn = screen.getByRole('heading', { name: /^Domestic$/i }).closest('button');
    fireEvent.click(domesticBtn!);

    expect(screen.queryByText(/Register Case/i)).not.toBeInTheDocument();
  });

  it('allows adding a custom rescue area', async () => {
    renderNewCase();
    const domesticBtn = screen.getByRole('heading', { name: /^Domestic$/i }).closest('button');
    fireEvent.click(domesticBtn!);

    const areaInput = screen.getByPlaceholderText(/Search or select area.../i);
    fireEvent.focus(areaInput);
    
    const othersBtn = screen.getByText(/Others \(Add New Area\)/i);
    fireEvent.click(othersBtn);

    const customInput = screen.getByPlaceholderText(/Type new area name.../i);
    fireEvent.change(customInput, { target: { value: 'My Custom Area' } });
    
    const addBtn = screen.getByText('Add');
    fireEvent.click(addBtn);

    expect(areaInput).toHaveValue('My Custom Area');
  });

  it('shows the current intake fields for a domestic case', async () => {
    renderNewCase();
    const domesticBtn = screen.getByRole('heading', { name: /^Domestic$/i }).closest('button');
    fireEvent.click(domesticBtn!);

    expect(screen.getAllByText(/Identification Photo/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Body video/i)).toBeInTheDocument();
  });

  it('does not expose submit for an incomplete phone number', async () => {
    renderNewCase();
    const domesticBtn = screen.getByRole('heading', { name: /^Domestic$/i }).closest('button');
    fireEvent.click(domesticBtn!);

    fireEvent.change(screen.getByLabelText(/Case Number \*/i), { target: { value: 'CASE-001' } });
    const areaInput = screen.getByPlaceholderText(/Search or select area.../i);
    fireEvent.focus(areaInput);
    fireEvent.click(screen.getByText('Hebbal'));

    // Invalid phone
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '123' } });

    expect(screen.queryByText(/Register Case/i)).not.toBeInTheDocument();
  });
});
