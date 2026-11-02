import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplicationDocuments from './ApplicationDocuments';
import { api } from '../utils/adminApi';
import { openDocumentFile } from '../utils/documentFiles';
jest.mock('../utils/adminApi',()=>({api:jest.fn()}));
jest.mock('../utils/documentFiles',()=>({openDocumentFile:jest.fn().mockResolvedValue()}));
const document={_id:'doc-1',documentId:'DOC-1',documentTitle:'Identity card',status:'Pending',adminRemark:'Needs review'};
const state={success:true,requirements:['Identity Proof'],documents:[{requirement:'Identity Proof',document}],canEdit:true,legacy:false};
beforeEach(()=>{jest.clearAllMocks();jest.spyOn(window,'prompt').mockReturnValue('Reviewed');});
afterEach(()=>jest.restoreAllMocks());
test('citizen sees the linked document and review reason',async()=>{api.mockResolvedValue(state);render(<ApplicationDocuments applicationId="app-1"/>);expect(await screen.findByText('DOC-1')).toBeInTheDocument();expect(screen.getByText('Needs review')).toBeInTheDocument();expect(screen.getByRole('button',{name:'Add / Replace Documents'})).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Verify Document'})).not.toBeInTheDocument();});
test('admin verifies within the selected application and refreshes status',async()=>{let verified=false;api.mockImplementation(async(path,options)=>{if(options?.method==='PATCH'){verified=true;return {success:true};}return {...state,canEdit:false,documents:[{requirement:'Identity Proof',document:{...document,status:verified?'Verified':'Pending'}}]};});render(<ApplicationDocuments applicationId="app-1" isAdmin/>);fireEvent.click(await screen.findByRole('button',{name:'Verify Document'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Verify Document'})).toBeDisabled());expect(api).toHaveBeenCalledWith('/api/digital-documents/admin/doc-1/verify',{method:'PATCH',body:JSON.stringify({adminRemark:'Reviewed'})},true);});
test('file view uses authenticated blob loading instead of a public file URL',async()=>{api.mockResolvedValue({...state,canEdit:false});render(<ApplicationDocuments applicationId="app-1" isAdmin/>);fireEvent.click(await screen.findByRole('button',{name:'View File'}));await waitFor(()=>expect(openDocumentFile).toHaveBeenCalledWith(document,true,false));});
test('legacy documents are not silently linked',async()=>{api.mockResolvedValue({...state,legacy:true,documents:[],canEdit:false});render(<ApplicationDocuments applicationId="app-1"/>);expect(await screen.findByText(/no original document requirement snapshot/)).toBeInTheDocument();expect(screen.getByText('No documents are linked to this application.')).toBeInTheDocument();});
test('server rejects remain visible and do not report a successful verification',async()=>{api.mockImplementation(async(path,options)=>{if(options?.method==='PATCH')throw new Error('The file is unavailable');return {...state,canEdit:false};});render(<ApplicationDocuments applicationId="app-1" isAdmin/>);fireEvent.click(await screen.findByRole('button',{name:'Verify Document'}));expect(await screen.findByRole('alert')).toHaveTextContent('file is unavailable');expect(screen.queryByText('Document changes saved.')).not.toBeInTheDocument();});

test('citizen saves requirement-to-document links without changing application status',async()=>{
    api.mockImplementation(async(path,options)=>path==='/api/digital-documents/my'?{documents:[document]}:options?.method==='PATCH'?{success:true}:state);
    render(<ApplicationDocuments applicationId="app-1"/>);
    fireEvent.click(await screen.findByRole('button',{name:'Add / Replace Documents'}));
    await screen.findByRole('option',{name:/Identity card/});
    await waitFor(()=>expect(screen.getByRole('button',{name:'Save Linked Documents'})).toBeEnabled());
    fireEvent.click(screen.getByRole('button',{name:'Save Linked Documents'}));
    await waitFor(()=>expect(api).toHaveBeenCalledWith('/api/service-applications/app-1/documents',{method:'PATCH',body:JSON.stringify({documents:[{requirement:'Identity Proof',document:'doc-1'}]})}));
});
