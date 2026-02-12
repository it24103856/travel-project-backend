import express from 'express';
import { registerUser, loginUser, isAdmin, getuser, googlelogin ,sendOtp,validateOtp} from '../controllers/userController.js';
const router = express.Router();

router.post('/create', registerUser);
router.post('/login', loginUser);
router.get('/isAdmin', isAdmin);
router.get('/', getuser);
router.post('/google-login', googlelogin);
router.post('/send-otp/:email', sendOtp)
router.post('/validate-otp', validateOtp);

export default router;