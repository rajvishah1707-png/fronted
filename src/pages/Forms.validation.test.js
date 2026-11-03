import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Feedback from './Feedback';
import AdminManagement from './AdminManagement';
import { api } from '../utils/adminApi';
jest.mock('../utils/adminApi', () => ({ api: jest.fn(), money: jest.fn() }));
jest.mock('../components/ManagementLayout', () => ({ children }) => <main>{children}</main>);
beforeEach(() => jest.clearAllMocks());

test('feedback blocks blank and overlong messages and sends valid feedback', async () => {
    api.mockResolvedValue({ feedback: [] });
    render(<Feedback />);
    await waitFor(() => expect(api).toHaveBeenCalledWith('/api/feedback'));
    const field = screen.getByLabelText('Your feedback');
    fireEvent.change(field, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Your feedback is required');
    expect(api).toHaveBeenCalledTimes(1);
    fireEvent.change(field, { target: { value: 'a'.repeat(2001) } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));
    expect(screen.getByRole('alert')).toHaveTextContent('at most 2000');
    expect(api).toHaveBeenCalledTimes(1);
    fireEvent.change(field, { target: { value: 'The application tracker is helpful.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));
    await waitFor(() => expect(api).toHaveBeenCalledWith('/api/feedback', { method: 'POST', body: JSON.stringify({ rating: 5, message: 'The application tracker is helpful.' }) }));
});

test('admin category form validates required name and its maximum length', async () => {
    api.mockResolvedValue({ categories: [] });
    render(<AdminManagement section="categories" />);
    const save = screen.getByRole('button', { name: 'Save Category' });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    expect(screen.getByRole('alert')).toHaveTextContent('Category name is required');
    const field = screen.getByLabelText('Category name');
    fireEvent.change(field, { target: { value: 'a'.repeat(81) } });
    fireEvent.click(save);
    expect(screen.getByRole('alert')).toHaveTextContent('at most 80');
    expect(api).toHaveBeenCalledTimes(1);
    fireEvent.change(field, { target: { value: 'Public Transport' } });
    fireEvent.click(save);
    await waitFor(() => expect(api).toHaveBeenCalledWith('/api/admin/system/categories', { method: 'POST', body: JSON.stringify({ name: 'Public Transport' }) }, true));
});

test('admin notifications require a citizen, title and message before sending', async () => {
    api.mockImplementation(async path => path.endsWith('/users') ? { users: [{ _id: 'citizen-1', name: 'Citizen', email: 'citizen@example.com' }] } : { notifications: [] });
    render(<AdminManagement section="notifications" />);
    const send = screen.getByRole('button', { name: 'Send Notification' });
    await waitFor(() => expect(send).toBeEnabled());
    fireEvent.click(send);
    expect(screen.getByRole('alert')).toHaveTextContent('Citizen is required');
    fireEvent.change(screen.getByLabelText('Citizen'), { target: { value: 'citizen-1' } });
    fireEvent.click(send);
    expect(screen.getByRole('alert')).toHaveTextContent('Title is required');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Application update' } });
    fireEvent.click(send);
    expect(screen.getByRole('alert')).toHaveTextContent('Message is required');
    expect(api).toHaveBeenCalledTimes(2);
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Your application is under review.' } });
    fireEvent.click(send);
    await waitFor(() => expect(api).toHaveBeenCalledWith('/api/admin/system/notifications', { method: 'POST', body: JSON.stringify({ userId: 'citizen-1', title: 'Application update', message: 'Your application is under review.' }) }, true));
});
