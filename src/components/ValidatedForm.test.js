import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ValidatedForm, { FormField } from './ValidatedForm';

test('blocks whitespace-only fields with a focused accessible error instead of a native popup', () => {
    const submit = jest.fn();
    render(<ValidatedForm onSubmit={submit}><label>Feedback<FormField as="textarea" rules={{ required: true }} defaultValue="   " /></label><button>Save</button></ValidatedForm>);
    fireEvent.click(screen.getByRole('button'));
    const field = screen.getByLabelText('Feedback');
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Feedback is required');
    expect(field).toHaveFocus();
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).not.toHaveAttribute('required');
    expect(field.closest('form')).toHaveAttribute('novalidate');
    fireEvent.input(field, { target: { value: 'Helpful platform' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(submit).toHaveBeenCalledTimes(1);
});

test('rejects malformed email using JavaScript and preserves the original submit event', () => {
    let submittedForm;
    const submit = jest.fn(event => { submittedForm = event.currentTarget; });
    render(<ValidatedForm onSubmit={submit}><FormField type="email" name="email" aria-label="Email" rules={{ required: true }} defaultValue="wrong" /><button>Save</button></ValidatedForm>);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('alert')).toHaveTextContent('valid email');
    expect(submit).not.toHaveBeenCalled();
    fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'citizen@example.com' } });
    fireEvent.click(screen.getByRole('button'));
    expect(submittedForm.tagName).toBe('FORM');
});

test('validates length, phone format and password confirmation without native constraint attributes', () => {
    const submit = jest.fn();
    render(<ValidatedForm onSubmit={submit}>
        <FormField name="phone" aria-label="Phone" defaultValue="12" rules={{ required: true, pattern: /^\d{10}$/, patternMessage: 'Enter 10 digits.' }} />
        <FormField name="password" aria-label="Password" type="password" defaultValue="secret" rules={{ required: true, minLength: 6 }} />
        <FormField name="confirmation" aria-label="Confirmation" type="password" defaultValue="other" rules={{ required: true, matches: 'password' }} />
        <button>Save</button>
    </ValidatedForm>);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter 10 digits');
    fireEvent.input(screen.getByLabelText('Phone'), { target: { value: '9876543210' } });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('alert')).toHaveTextContent('does not match');
    fireEvent.input(screen.getByLabelText('Confirmation'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button'));
    expect(submit).toHaveBeenCalledTimes(1);
});

test('honors changing required rules and removes unmounted fields', () => {
    const submit = jest.fn();
    const Form = ({ creating }) => <ValidatedForm onSubmit={submit}>{creating && <FormField aria-label="Name" rules={{ required: true }} />}<FormField aria-label="Password" rules={{ required: creating }} /><button>Save</button></ValidatedForm>;
    const { rerender } = render(<Form creating />);
    fireEvent.click(screen.getByRole('button'));
    expect(submit).not.toHaveBeenCalled();
    rerender(<Form creating={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(submit).toHaveBeenCalledTimes(1);
});

test('preserves input refs and validates required document selections and file size', () => {
    const submit = jest.fn();
    const fileRef = createRef();
    render(<ValidatedForm onSubmit={submit}>
        <FormField as="select" aria-label="Identity proof" rules={{ required: true }}><option value="">Select</option><option value="doc-1">Existing document</option></FormField>
        <FormField ref={fileRef} type="file" aria-label="Upload" rules={{ required: true, maxBytes: 2, fileTypes: ['application/pdf'] }} />
        <button>Save</button>
    </ValidatedForm>);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('alert')).toHaveTextContent('Identity proof is required');
    fireEvent.change(screen.getByLabelText('Identity proof'), { target: { value: 'doc-1' } });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('alert')).toHaveTextContent('Upload is required');
    fireEvent.change(fileRef.current, { target: { files: [new File(['large'], 'proof.pdf', { type: 'application/pdf' })] } });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('alert')).toHaveTextContent('no larger than');
    expect(submit).not.toHaveBeenCalled();
});
