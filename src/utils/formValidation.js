// Client-side validation only. Authentication and business rules stay on the server.
export function validateField(field, rules = {}, form) {
    if (field.disabled || field.readOnly || field.type === 'hidden') return '';
    const label = rules.label || field.getAttribute('aria-label') || field.labels?.[0]?.textContent?.replace(/\s+/g, ' ').replace(/\*/g, '').trim()
        || field.name?.replace(/([A-Z])/g, ' $1') || 'This field';
    const raw = String(field.value ?? '');
    const value = field.type === 'password' ? raw : raw.trim();
    const empty = field.type === 'file' ? !field.files?.length
        : ['checkbox', 'radio'].includes(field.type) ? !field.checked : !raw.trim();
    if (empty) return rules.required ? `${label} is required.` : '';
    if ((rules.email || field.type === 'email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `Enter a valid email address for ${label}.`;
    if (rules.minLength != null && value.length < rules.minLength) return `${label} must contain at least ${rules.minLength} characters.`;
    if (rules.maxLength != null && raw.length > rules.maxLength) return `${label} must contain at most ${rules.maxLength} characters.`;
    if (rules.pattern && !rules.pattern.test(value)) return rules.patternMessage || `${label} has an invalid format.`;
    if (rules.number || field.type === 'number') {
        const number = Number(value);
        if (!Number.isFinite(number) || (rules.integer && !Number.isInteger(number))) return `${label} must be a valid ${rules.integer ? 'whole ' : ''}number.`;
        if (rules.min != null && number < rules.min) return `${label} must be at least ${rules.min}.`;
        if (rules.max != null && number > rules.max) return `${label} must be at most ${rules.max}.`;
    }
    if (rules.matches && raw !== form?.elements.namedItem(rules.matches)?.value) return rules.matchMessage || `${label} does not match.`;
    if (field.type === 'file') {
        for (const file of Array.from(field.files || [])) {
            if (rules.maxBytes && file.size > rules.maxBytes) return `${label}: file must be no larger than ${rules.maxBytes / (1024 * 1024)} MB.`;
            if (rules.fileTypes && !rules.fileTypes.includes(file.type)) return `${label}: select a supported file type.`;
        }
    }
    return rules.validate?.(value, form) || '';
}
