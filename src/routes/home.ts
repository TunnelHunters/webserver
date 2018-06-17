import path from 'path'
import express from 'express'
const router = express.Router();

router.get('/', (req, res): void => {
    res.sendFile('index.html', {
        root: path.join(process.cwd(), 'views')
    });
});

export default router
