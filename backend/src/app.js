import express from 'express';
import cors from 'cors';
import webhookRouter from './routes/webhook.js';
import reviewsRouter from './routes/reviews.js';

const app = express();

app.use(cors());
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/webhook', webhookRouter);
app.use('/reviews', reviewsRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});



import errorHandler from './middleware/errorHandler.js';
app.use(errorHandler);

export default app;