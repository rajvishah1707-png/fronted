import React, { createContext, forwardRef, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { validateField } from '../utils/formValidation';
import './ValidatedForm.css';

const RegisterField = createContext(null);

// Rules are JavaScript objects, not native HTML constraints.
export const FormField = forwardRef(function FormField({ as: Element = 'input', rules = {}, ...props }, forwardedRef) {
    const register = useContext(RegisterField);
    const element = useRef(null);
    const currentRules = useRef(rules);
    currentRules.current = rules;
    const setRef = useCallback(node => {
        element.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef]);
    useEffect(() => register?.(element.current, () => currentRules.current), [register]);
    return <Element {...props} ref={setRef} aria-label={props["aria-label"] || rules.label} aria-required={rules.required || undefined} />;
});

export default function ValidatedForm({ onSubmit, onInput, onReset, children, ...props }) {
    const fields = useRef(new Map());
    const [error, setError] = useState(null);
    const errorId = useId();
    const register = useCallback((element, getRules) => {
        if (!element) return undefined;
        fields.current.set(element, getRules);
        return () => { fields.current.delete(element); };
    }, []);
    const clearError = () => {
        if (error?.field) {
            error.field.removeAttribute('aria-invalid');
            const descriptions = (error.field.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== errorId);
            if (descriptions.length) error.field.setAttribute('aria-describedby', descriptions.join(' '));
            else error.field.removeAttribute('aria-describedby');
        }
        setError(null);
    };
    const submit = event => {
        event.preventDefault();
        clearError();
        const form = event.currentTarget;
        for (const field of Array.from(form.elements)) {
            if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(field.tagName)) continue;
            const message = validateField(field, fields.current.get(field)?.() || {}, form);
            if (message) {
                field.setAttribute('aria-invalid', 'true');
                const existing = field.getAttribute('aria-describedby');
                field.setAttribute('aria-describedby', [existing, errorId].filter(Boolean).join(' '));
                setError({ field, message });
                field.focus();
                return;
            }
        }
        return onSubmit?.(event);
    };
    return <RegisterField.Provider value={register}>
        <form {...props} noValidate onSubmit={submit}
            onInput={event => { if (error) clearError(); onInput?.(event); }}
            onReset={event => { clearError(); onReset?.(event); }}>
            {error && <p id={errorId} className="form-validation-error" role="alert">{error.message}</p>}
            {children}
        </form>
    </RegisterField.Provider>;
}
