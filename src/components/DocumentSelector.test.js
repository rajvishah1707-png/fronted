import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentSelector from './DocumentSelector';
import { api } from '../utils/adminApi';
jest.mock('../utils/adminApi',()=>({api:jest.fn()}));
const stored={_id:'doc-1',documentTitle:'Identity card',documentType:'Identity Proof',status:'Pending'};
function Form(){const [value,setValue]=useState([]);return <><DocumentSelector requirements={['Identity Proof']} value={value} onChange={setValue}/><output>{JSON.stringify(value)}</output></>;}
beforeEach(()=>jest.clearAllMocks());
test('existing documents are selectable by requirement and rejected files are excluded',async()=>{
    api.mockResolvedValue({documents:[stored,{...stored,_id:'rejected',documentTitle:'Rejected file',status:'Rejected'}]});render(<Form/>);
    await screen.findByRole('option',{name:'Identity card · Identity Proof · Pending'});
    expect(screen.queryByRole('option',{name:/Rejected file/})).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'),{target:{value:'doc-1'}});
    expect(screen.getByRole('status')).toHaveTextContent('"requirement":"Identity Proof","document":"doc-1"');
    expect(screen.getByRole('combobox')).toBeRequired();
});
test('upload uses the existing authenticated multipart endpoint and selects the new file',async()=>{
    api.mockImplementation(async(path,options)=>options?.method==='POST'?{document:{...stored,_id:'new-document'}}:{documents:[]});render(<Form/>);
    const input=screen.getByLabelText('Or upload Identity Proof');await waitFor(()=>expect(input).toBeEnabled());
    fireEvent.change(input,{target:{files:[new File(['%PDF-test'],'proof.pdf',{type:'application/pdf'})]}});
    await screen.findByText(/uploaded and selected/);
    const uploadCall=api.mock.calls.find(([,options])=>options?.method==='POST');
    expect(uploadCall[0]).toBe('/api/digital-documents');expect(uploadCall[1].body.get('documentType')).toBe('Identity Proof');
    expect(uploadCall[1].body.get('document').name).toBe('proof.pdf');
    expect(screen.getByRole('combobox')).toHaveValue('new-document');
});
test('invalid uploads show an actionable error without creating a record',async()=>{
    api.mockResolvedValue({documents:[]});render(<Form/>);const input=screen.getByLabelText('Or upload Identity Proof');await waitFor(()=>expect(input).toBeEnabled());
    fireEvent.change(input,{target:{files:[new File(['bad'],'script.html',{type:'text/html'})]}});
    expect(screen.getByRole('alert')).toHaveTextContent('PDF, JPG or PNG');expect(api).toHaveBeenCalledTimes(1);
});
