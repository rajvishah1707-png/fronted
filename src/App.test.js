import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
jest.mock('./pages/Payments', () => ({ __esModule:true, default:({isAdmin}) => <h1>{isAdmin ? 'Admin payments route' : 'Citizen payments route'}</h1> }));
jest.mock('./pages/AdminManagement', () => ({ __esModule:true, default:({section}) => <h1>{section} management route</h1> }));
jest.mock('./pages/ApplicationStatus', () => ({ __esModule:true, default:() => <h1>Application details route</h1> }));
beforeEach(()=>localStorage.clear());
test.each(['categories','notifications','feedback','statistics'])('admin %s menu has a protected destination', section=>{
    localStorage.setItem('adminToken','test-token');localStorage.setItem('admin','{}');localStorage.setItem('adminLoggedIn','true');
    window.history.pushState({},'',`/admin/${section}`);render(<App/>);
    expect(screen.getByRole('heading',{name:`${section} management route`})).toBeInTheDocument();
});
test('admin payment destination requires the actual token as well as the login flag',()=>{
    localStorage.setItem('admin','{}');localStorage.setItem('adminLoggedIn','true');
    window.history.pushState({},'','/admin/payments');render(<App/>);
    expect(window.location.pathname).toBe('/admin-login');
});
test('citizen payment destination resolves',()=>{
    localStorage.setItem('smartCityToken','test-token');window.history.pushState({},'','/payments');render(<App/>);
    expect(screen.getByRole('heading',{name:'Citizen payments route'})).toBeInTheDocument();
});
test('application detail links remain reachable after the admin changes',()=>{
    localStorage.setItem('smartCityToken','test-token');window.history.pushState({},'','/application-status/abc');render(<App/>);
    expect(screen.getByRole('heading',{name:'Application details route'})).toBeInTheDocument();
});
