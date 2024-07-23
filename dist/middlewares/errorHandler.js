"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    return res.status(500).json({
        message: 'Internal Server Error',
    });
};
exports.errorHandler = errorHandler;
