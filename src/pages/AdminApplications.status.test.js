import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import AdminApplications from './AdminApplications';
import { adminFetch } from '../utils/adminApi';
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
jest.mock('../utils/adminApi', () => ({ adminFetch: jest.fn() }));
jest.mock('../components/ApplicationDocuments', () => () => null);
const application = { _id:'app-1', applicationId:'APP-1', serviceName:'Property certificate', status:'Pending' };
beforeEach(() => { jest.clearAllMocks(); jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => jest.restoreAllMocks());
test('a blocked transition resets the selection and shows the verification reason next to the application', async () => {
    adminFetch.mockResolvedValueOnce({ ok:true, json:async () => ({ applications:[application] }) })
        .mockResolvedValueOnce({ ok:false, json:async () => ({ message:'All linked documents must be verified' }) });
    render(<AdminApplications />);
    const id = await screen.findByText('APP-1');
    const card = id.closest('.application-card');
    const select = within(card).getByRole('combobox');
    fireEvent.change(select, { target:{ value:'In Progress' } });
    fireEvent.click(within(card).getByRole('button', { name:/Update Application/ }));
    await waitFor(() => expect(select).toHaveValue('Pending'));
    expect(within(card).getByRole('alert')).toHaveTextContent('All linked documents must be verified');
    expect(within(card).getByRole('alert')).toHaveTextContent('Status was not changed');
    expect(screen.queryByText(/updated successfully/)).not.toBeInTheDocument();
});
test('displays the status actually saved by the server', async () => {
    adminFetch.mockResolvedValueOnce({ ok:true, json:async () => ({ applications:[application] }) })
        .mockResolvedValueOnce({ ok:true, json:async () => ({ success:true, application:{ ...application, status:'Under Review' } }) });
    render(<AdminApplications />);
    const card = (await screen.findByText('APP-1')).closest('.application-card');
    const select = within(card).getByRole('combobox');
    fireEvent.change(select, { target:{ value:'In Progress' } });
    fireEvent.click(within(card).getByRole('button', { name:/Update Application/ }));
    await waitFor(() => expect(select).toHaveValue('Under Review'));
});
