import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

test('all source forms disable native validation and fields contain no HTML validation constraints', () => {
    const violations = [];
    const walk = directory => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const file = path.join(directory, entry.name);
            if (entry.isDirectory()) { walk(file); continue; }
            if (!file.endsWith('.js') || file.endsWith('.test.js')) continue;
            const ast = parse(fs.readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
            traverse(ast, { JSXOpeningElement({ node }) {
                const name = node.name.name;
                if (name === 'form' && !node.attributes.some(a => a.name?.name === 'noValidate')) violations.push(`${file}: native form validation enabled`);
                if (['input', 'select', 'textarea'].includes(name)) {
                    for (const attribute of node.attributes) {
                        if (['required', 'minLength', 'maxLength', 'min', 'max', 'pattern'].includes(attribute.name?.name)) violations.push(`${file}: native ${attribute.name.name}`);
                    }
                }
            } });
        }
    };
    walk(path.resolve(__dirname, '..'));
    expect(violations).toEqual([]);
});
