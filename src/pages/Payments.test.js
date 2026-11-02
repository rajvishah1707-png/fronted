import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Payments from './Payments';
import { api } from '../utils/adminApi';
jest.mock('../utils/adminApi',()=>({api:jest.fn(),money:amount=>`INR ${(amount||0)/100}`}));
const application={_id:'app1',applicationId:'APP-1',serviceName:'Water',citizenName:'Citizen',status:'Approved',feePaise:25000};
const list=rows=>({success:true,rows,total:rows.length,configured:true});
beforeEach(()=>{jest.clearAllMocks();delete window.Razorpay;});
test('unapproved applications do not expose a checkout button',async()=>{
    api.mockResolvedValue(list([{application:{...application,status:'Pending'},status:'Awaiting Approval',canPay:false}]));
    render(<MemoryRouter><Payments/></MemoryRouter>);
    expect(await screen.findByText('Awaiting Approval')).toBeInTheDocument();
    expect(screen.queryByRole('button',{name:/Pay INR/})).not.toBeInTheDocument();
});
test('checkout uses server order and verifies the gateway response',async()=>{
    const row={application,status:'Pending',canPay:true};
    api.mockImplementation(async(path)=>path==='/api/payments/orders'?{keyId:'rzp_test_example',order:{id:'order_1',amount:25000,currency:'INR'}}:path==='/api/payments/verify'?{success:true}:list([row]));
    let options;
    window.Razorpay=jest.fn().mockImplementation(input=>{options=input;return {on:jest.fn(),open:()=>input.handler({razorpay_order_id:'order_1',razorpay_payment_id:'pay_1',razorpay_signature:'signature'})};});
    render(<MemoryRouter><Payments/></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button',{name:'Pay INR 250'}));
    await screen.findByText(/Test payment verified/);
    const orderCall=api.mock.calls.find(([path])=>path==='/api/payments/orders');
    expect(JSON.parse(orderCall[1].body)).toEqual({applicationId:'app1'});
    expect(options.order_id).toBe('order_1');expect(options.amount).toBe(25000);
    expect(api.mock.calls.some(([path])=>path==='/api/payments/verify')).toBe(true);
});
test('failed verification is shown without a false success message',async()=>{
    api.mockImplementation(async(path)=>{if(path==='/api/payments/orders')return {keyId:'rzp_test_example',order:{id:'order_1',amount:25000}};if(path==='/api/payments/verify')throw new Error('Payment is not captured yet');return list([{application,status:'Created',canPay:true}]);});
    window.Razorpay=jest.fn().mockImplementation(input=>({on:jest.fn(),open:()=>input.handler({razorpay_order_id:'order_1',razorpay_payment_id:'pay_1',razorpay_signature:'signature'})}));
    render(<MemoryRouter><Payments/></MemoryRouter>);fireEvent.click(await screen.findByRole('button',{name:'Pay INR 250'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('not captured');expect(screen.queryByText(/Test payment verified/)).not.toBeInTheDocument();
});
test('paid transaction has a printable test receipt and no payment button',async()=>{
    api.mockResolvedValue(list([{application,status:'Paid',canPay:false,payment:{status:'Paid',amountPaise:25000,receipt:'sc_receipt',paymentId:'pay_1'}}]));
    render(<MemoryRouter><Payments/></MemoryRouter>);fireEvent.click(await screen.findByRole('button',{name:'View Receipt'}));
    expect(screen.getByText('TEST PAYMENT · Not valid as proof of a real payment')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Print / Save PDF'})).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Pay INR 250'})).not.toBeInTheDocument();
});
test('admin gets fee assessment for legacy applications, and citizen checkout is absent',async()=>{
    api.mockImplementation(async path=>path==='/api/payments/summary'?{summary:{}}:list([{application:{...application,feePaise:null},status:'Fee Not Set',canPay:false}]));
    render(<MemoryRouter><Payments isAdmin/></MemoryRouter>);
    expect(await screen.findByRole('button',{name:'Assess Fee'})).toBeInTheDocument();
    await waitFor(()=>expect(api).toHaveBeenCalledWith('/api/payments/summary',{},true));
    expect(screen.queryByRole('button',{name:'Pay INR 250'})).not.toBeInTheDocument();
});
