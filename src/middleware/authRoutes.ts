import express from 'express';
import { firebaseSignupController } from './firebaseControllers';

const router = express();

router.post('/register', firebaseSignupController);

export default router;
