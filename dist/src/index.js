import express, {} from 'express';
import 'dotenv/config';
import eventRouter from './routes/event.route.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.route.js';
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.get('/', (request, res) => {
    res.send('Hi');
});
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.listen(3000, () => {
    console.log(`Server running at port ${port}`);
});
//# sourceMappingURL=index.js.map