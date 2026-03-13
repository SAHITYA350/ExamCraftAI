import express from 'express';
import cors from 'cors';
import './config/env.js';

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));

import userRoutes from './routes/user.routes.js';

app.use('/api/v1/users', userRoutes);


export { app }