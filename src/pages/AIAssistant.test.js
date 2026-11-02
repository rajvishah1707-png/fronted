import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIAssistant from './AIAssistant';
const mockNavigate=jest.fn();
jest.mock('react-router-dom',()=>({useNavigate:()=>mockNavigate}));
beforeEach(()=>{jest.clearAllMocks();localStorage.clear();localStorage.setItem('smartCityToken','citizen-jwt');localStorage.setItem('smartCityUser',JSON.stringify({name:'Citizen'}));global.fetch=jest.fn();});
const reply=text=>({ok:true,status:200,json:async()=>({success:true,reply:text})});
function send(question='How can I make a payment?'){fireEvent.change(screen.getByRole('textbox',{name:'Your question'}),{target:{value:question}});fireEvent.click(screen.getByRole('button',{name:'Send message'}));}
test('current citizen login works without the obsolete user key',async()=>{
    fetch.mockResolvedValue(reply('Open Payments after approval.'));render(<AIAssistant/>);send();
    expect(await screen.findByText('Open Payments after approval.')).toBeInTheDocument();expect(mockNavigate).not.toHaveBeenCalled();
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer citizen-jwt');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({message:'How can I make a payment?'});
});
test('quick questions and Enter cannot start duplicate requests while waiting',async()=>{
    let finish;fetch.mockReturnValue(new Promise(resolve=>{finish=resolve}));render(<AIAssistant/>);
    fireEvent.click(screen.getByRole('button',{name:'How can I make a payment?'}));
    expect(screen.getByRole('button',{name:'How can I apply for a service?'})).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('textbox',{name:'Your question'}),{key:'Enter'});expect(fetch).toHaveBeenCalledTimes(1);
    finish(reply('Payment guidance'));await screen.findByText('Payment guidance');
});
test('network errors preserve the question and allow retry',async()=>{
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(reply('Try Payments now.'));render(<AIAssistant/>);send('payment help');
    await screen.findByText(/Unable to connect to the assistant/);
    expect(screen.getByRole('textbox',{name:'Your question'})).toHaveValue('payment help');
    await waitFor(()=>expect(screen.getByRole('button',{name:'Send message'})).toBeEnabled());
    fireEvent.click(screen.getByRole('button',{name:'Send message'}));expect(await screen.findByText('Try Payments now.')).toBeInTheDocument();
});
test('missing or corrupt citizen session goes to login without sending',()=>{
    localStorage.setItem('smartCityUser','broken-json');render(<AIAssistant/>);send();
    expect(mockNavigate).toHaveBeenCalledWith('/login',{replace:true});expect(fetch).not.toHaveBeenCalled();
});
test('expired sessions clear the actual login keys',async()=>{
    fetch.mockResolvedValue({status:401});render(<AIAssistant/>);send();
    await waitFor(()=>expect(mockNavigate).toHaveBeenCalledWith('/login',{replace:true}));
    expect(localStorage.getItem('smartCityToken')).toBeNull();expect(localStorage.getItem('smartCityUser')).toBeNull();
});
test('logout clears current and legacy session keys',()=>{
    localStorage.setItem('user','{}');localStorage.setItem('token','old');render(<AIAssistant/>);fireEvent.click(screen.getByRole('button',{name:/Logout/}));
    for(const key of ['smartCityUser','smartCityToken','user','token'])expect(localStorage.getItem(key)).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login',{replace:true});
});
test('server errors remain visible and do not append an empty answer',async()=>{
    fetch.mockResolvedValue({ok:false,status:503,json:async()=>({success:false,message:'Please try again later'})});render(<AIAssistant/>);send();
    expect(await screen.findByText('Please try again later')).toBeInTheDocument();expect(screen.getByText('Connection problem · You can retry')).toBeInTheDocument();
});
