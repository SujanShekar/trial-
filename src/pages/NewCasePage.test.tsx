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

  it('validates required fields on submission', async () => {
    renderNewCase();
    // Transition to form
    const domesticBtn = screen.getByRole('heading', { name: /^Domestic$/i }).closest('button');
    fireEvent.click(domesticBtn!);

    const saveBtn = screen.getByText(/Save Case/i);
    fireEvent.click(saveBtn);

    expect(window.alert).toHaveBeenCalledWith("Please enter a Case Number.");
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

  it('submits the form successfully with valid data', async () => {
    renderNewCase();
    const domesticBtn = screen.getByRole('heading', { name: /^Domestic$/i }).closest('button');
    fireEvent.click(domesticBtn!);

    // Fill Case Number
    fireEvent.change(screen.getByLabelText(/Case Number \*/i), { target: { value: 'CASE-001' } });
    
    // Select Area
    const areaInput = screen.getByPlaceholderText(/Search or select area.../i);
    fireEvent.focus(areaInput);
    
    // Need to wait for suggestions to appear
    const hebbalBtn = screen.getByText('Hebbal');
    fireEvent.click(hebbalBtn);

    // Fill Reporter Phone (Valid 10 digits)
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '9876543210' } });

    // Fill Animal Details
    fireEvent.change(screen.getByLabelText(/Animal Category/i), { target: { value: 'Dog' } });

    const saveBtn = screen.getByText(/Save Case/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockAddCase).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('CASE-001 has been successfully registered'));
    });
  });

  it('errors on invalid phone number length', async () => {
    renderNewCase();
    const domesticBtn = screen.getByRole('heading', { name: /^Domestic$/i }).closest('button');
    fireEvent.click(domesticBtn!);

    fireEvent.change(screen.getByLabelText(/Case Number \*/i), { target: { value: 'CASE-001' } });
    const areaInput = screen.getByPlaceholderText(/Search or select area.../i);
    fireEvent.focus(areaInput);
    fireEvent.click(screen.getByText('Hebbal'));

    // Invalid phone
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '123' } });

    const saveBtn = screen.getByText(/Save Case/i);
    fireEvent.click(saveBtn);

    expect(window.alert).toHaveBeenCalledWith("Reporter phone number must be exactly 10 digits.");
  });
});
