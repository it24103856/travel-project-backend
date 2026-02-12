import express, { Router } from 'express';
import { createContact, getContct,deleteContact,updateContact,sendMessage,getAllMessage} from '../controllers/contactController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

//oni kenekta puluwan
router.get('/get', getContct);
router.post("/send-message",sendMessage)

//admin kenekta withari puluwan 

router.post('/create', protect, isAdmin, createContact);
router.delete('/delete/:id', protect, isAdmin, deleteContact);
router.put('/update/:id', protect, isAdmin, updateContact);
router.get("/messages",protect,isAdmin,getAllMessage)

export default router;