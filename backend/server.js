import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/sessions', sessionRoutes);

app.get('/', (req, res) => {
    res.send('ExamCraft AI API is running...');
});

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

// Database connection and server start
const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n⚙️  Server is running at port : ${PORT}`);
            console.log(`🔗 Network Access: http://10.109.108.214:${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });