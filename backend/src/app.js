import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './config/env.js';

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cookieParser());


app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));

import userRoutes from './routes/user.routes.js';

app.use('/api/v1/users', userRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error(`[Backend Error] ${statusCode}: ${message}`);
    
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || []
    });
});

export { app }