import express, {} from 'express';
import 'dotenv/config';
import eventRouter from './routes/event.route.js';
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.get('/', (request, res) => {
    res.send('Hi');
});
app.use('/api/v1/events', eventRouter);
app.listen(3000, () => {
    console.log(`Server running at port ${port}`);
});
//# sourceMappingURL=index.js.map