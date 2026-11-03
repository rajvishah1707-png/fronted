import React from 'react';
import { render, screen, act } from '@testing-library/react';
import MyApplications from './MyApplications';
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
afterEach(() => { jest.useRealTimers(); localStorage.clear(); delete global.fetch; });
test('shows the new server status without reloading the citizen page', async () => {
    jest.useFakeTimers();
    localStorage.setItem('smartCityToken', 'test-token');
    let status = 'Pending';
    global.fetch = jest.fn(async () => ({ ok:true, json:async () => ({ success:true, applications:[{ _id:'app-1', applicationId:'APP-1', serviceName:'Property certificate', status }] }) }));
    await act(async () => { render(<MyApplications />); });
    expect(screen.getByText('APP-1')).toBeInTheDocument();
    status = 'In Progress';
    await act(async () => { jest.advanceTimersByTime(10000); });
    expect(screen.getByText('In Progress', { selector: '.application-status' })).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(2);
});
