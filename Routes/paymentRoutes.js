import express from "express";
import { 
    createManualPayment, 
    getAllPendingPayments, 
    updatePaymentStatus, 
    getMyPayments, 
    requestPaymentCancel, 
    approveCancelRequest 
} from "../controllers/paymentController.js";
import { isAdmin,protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---  (Customer)  Routes ---

// 1.  (Manual Payment Upload)
router.post("/create", protect, createManualPayment);

// 2. my payments list
router.get("/my-payments", protect, getMyPayments);

// 3. Payment cancel request
router.post("/request-cancel", protect, requestPaymentCancel);


// ---  (Admin)  Routes ---

// 4. Pending Payments List
router.get("/admin/pending", protect, isAdmin, getAllPendingPayments);

// 5.  (Status)  (Approve/Reject)
router.patch("/admin/update-status/:paymentId", protect, isAdmin, updatePaymentStatus);

// 6.  (Refund Approve)
router.patch("/admin/approve-cancel", protect, isAdmin, approveCancelRequest);

export default router;