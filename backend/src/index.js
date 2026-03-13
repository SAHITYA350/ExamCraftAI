import { app } from "./app.js";
import './db/DBconn.js';
import connectDB from "./db/DBconn.js";

app.on('error', (err) => {
    console.error('Server error:', err);
});

app.get('/', (req, res) => {
    res.send('Welcome to the ExamCraft AI API');
})

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to the database:', err);
    })
