import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import authRoutes from './routes/auth.routes';
import reportRoutes from './routes/report.routes';

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('Finance Report Backend is running.');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
