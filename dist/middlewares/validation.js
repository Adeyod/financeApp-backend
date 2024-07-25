"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateField = void 0;
const forbiddenCharsRegex = /[|!{}()&=[\]===><>]/;
const validateField = (field) => {
    const trimmed = field.trim();
    if (trimmed === '') {
        throw new Error('All fields are required');
    }
    if (forbiddenCharsRegex.test(trimmed)) {
        throw new Error(`Forbidden characters at ${field}`);
    }
    return field;
};
exports.validateField = validateField;
