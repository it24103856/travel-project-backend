# Booking-Payment ID Synchronization Guide

## Overview
This document outlines how BookingIDs are synchronized across the Booking and Payment modules to ensure data integrity and proper tracking.

## Architecture

### Flow Diagram
```
1. Booking Creation (Frontend)
   └─> User completes booking → Booking created with ID (e.g., _id: ObjectId)
   └─> BookingID returned to frontend

2. Navigation to Payment
   └─> Navigation state includes bookingId
   └─> Payment selection page receives bookingId

3. Payment Creation (Backend)
   └─> Validate bookingId exists and belongs to user
   └─> Generate bookingReference (BK-[ID8chars]-[timestamp])
   └─> Create Payment record with bookingId reference
   └─> Create unique transactionId

4. Status Synchronization
   └─> Payment status updates
   └─> Booking status synced accordingly
```

## Components

### 1. Booking Model
**File:** `models/Booking.js`

Fields:
- `_id` (auto-generated ObjectId) - **PRIMARY BOOKING ID**
- `userId` (ref to User)
- `status` (enum: "Pending", "Confirmed", "Cancelled")
- `totalPrice`

**Key Point:** BookingID is the MongoDB ObjectId, automatically generated during creation.

### 2. Payment Model
**File:** `models/Payment.js`

Fields:
- `_id` (auto-generated ObjectId) - **PAYMENT ID**
- `bookingId` (ObjectId ref to Booking) - **KEY REFERENCE TO BOOKING**
- `bookingReference` (String) - **Human-readable booking reference**
  - Format: `BK-[8 chars from bookingId]-[timestamp]`
  - Example: `BK-507F1F7-1673046923`
- `userId` (ObjectId ref to User)
- `transactionId` (String, unique, sparse) - **TRANSACTION IDENTIFIER**
- `paymentStatus` (enum: "pending", "processing", "completed", "failed", "refunded", "cancel_requested")
- `amount`
- `currency`
- `paymentMethod` (enum: "card", "bank_transfer", "crypto")

**Key Points:**
1. `bookingId` is the **primary synchronization key**
2. `bookingReference` is for **human-readable reporting**
3. `transactionId` is **unique per transaction** to prevent duplicates

### 3. Frontend Flow

#### BookingPage (`Pages/BookingPage.jsx`)
```javascript
// After successful booking creation
const res = await axios.post(`${base}/bookings/create`, payload);
if (res.data.success) {
  navigate("/payment", {
    state: {
      bookingDetails: {
        bookingId: res.data.data._id,  // ← MongoDB ObjectId
        total: formData.selectedRoom?.finalPrice,
        currency: "LKR",
      },
    }
  });
}
```

#### PaymentPage (`Pages/paymentPage.jsx`)
```javascript
const bookingData = location.state?.bookingDetails;
// Passes bookingId to payment method selection
```

#### BankTransferPage (`components/BankTranferPage.jsx`)
```javascript
const { amount, bookingId } = location.state;
// Uses bookingId in payment submission
const submissionData = {
  bookingId,  // ← Sends MongoDB ObjectId to backend
  amount,
  paymentMethod: "bank_transfer",
  // ... other fields
};
```

### 4. Backend Validation Service

**File:** `services/bookingPaymentSyncService.js`

Key Functions:
1. `validateBookingForPayment(bookingId, userId)`
   - Validates booking exists
   - Validates booking belongs to user
   - Validates booking is not cancelled

2. `isTransactionIdUnique(transactionId)`
   - Prevents duplicate transaction IDs
   - Ensures idempotency

3. `syncPaymentStatusToBooking(paymentId, newPaymentStatus)`
   - Synchronizes payment status to booking status
   - Mapping:
     - `completed` → booking status: `Confirmed`
     - `refunded/cancelled` → booking status: `Cancelled`
     - `failed/processing` → booking status: `Pending`

4. `generateBookingReference(bookingId)`
   - Creates human-readable reference
   - Format: `BK-[8 chars]-[timestamp]`

### 5. Payment Controller Updates

**File:** `controllers/paymentController.js`

#### createManualPayment()
1. Validates bookingId exists (HTTP 404 if not)
2. Validates booking belongs to user (HTTP 403 if not)
3. Validates transactionId uniqueness (HTTP 409 if duplicate)
4. Generates bookingReference
5. Creates Payment with:
   - `bookingId` reference
   - `bookingReference` for tracking
   - `transactionId` (unique)
6. Returns bookingReference in response

#### updatePaymentStatus()
1. Updates payment status
2. Calls `syncPaymentStatusToBooking()` to update booking
3. Returns bookingReference in response

## Status Synchronization Flow

### Payment Completion Workflow
```
1. Payment created: paymentStatus = "processing"
   ↓ (if AI verification passes)
2. Payment updated: paymentStatus = "completed"
   ↓ (sync service triggers)
3. Booking updated: status = "Confirmed"
```

### Payment Refund Workflow
```
1. User requests cancellation
   ↓
2. Payment: paymentStatus = "cancel_requested"
   ↓ (admin approves)
3. Payment updated: paymentStatus = "refunded"
   ↓ (sync service triggers)
4. Booking updated: status = "Cancelled"
```

## Data Validation & Error Handling

### Validation Checks

1. **BookingID Validation**
   - Must be valid MongoDB ObjectId
   - Must exist in database
   - Must belong to authenticated user
   - Status must not be "Cancelled"

2. **TransactionID Validation**
   - Must be unique across all payments
   - Case-sensitive
   - Optional (null allowed)
   - Sparse index prevents duplicate nulls

3. **Amount Validation**
   - Must match booking's totalPrice
   - Within tolerance of ±1 LKR for AI verification

### Error Responses

```javascript
// Invalid BookingID
{ success: false, message: "Booking not found", statusCode: 404 }

// Booking belongs to different user
{ success: false, message: "Unauthorized: This booking does not belong to you", statusCode: 403 }

// Duplicate TransactionID
{ success: false, message: "Transaction ID already exists", isDuplicate: true, statusCode: 409 }
```

## API Response Strategy

### Payment Creation Response
```javascript
{
  success: true,
  message: "Payment submitted successfully",
  paymentId: "65a1b2c3d4e5f6g7h8i9j0",
  bookingReference: "BK-507F1F7-1673046923",  // Human-readable
  paymentStatus: "processing"
}
```

### Payment Status Update Response
```javascript
{
  success: true,
  message: "Payment and Booking status updated",
  bookingReference: "BK-507F1F7-1673046923"
}
```

## Database Indexing

### Current Indexes
- `Payment.bookingId` - Indexed for fast lookups
- `Payment.userId` - Indexed for user-specific queries
- `Payment.transactionId` - Unique, sparse index

### Query Patterns

1. **Get all payments for a booking**
   ```javascript
   Payment.find({ bookingId: ObjectId("...") })
   ```

2. **Get payment by transaction ID**
   ```javascript
   Payment.findOne({ transactionId: "BK-507F1F7" })
   ```

3. **Get pending payments**
   ```javascript
   Payment.find({ paymentStatus: { $in: ["processing", "pending"] } })
   ```

## Testing Checklist

- [ ] Booking creates successfully with ObjectId
- [ ] BookingID passed correctly to payment page
- [ ] Payment validation rejects non-existent bookingId
- [ ] Payment validation rejects bookings from other users
- [ ] TransactionID duplicate detection works
- [ ] BookingReference generated correctly
- [ ] Payment status update syncs to booking status
- [ ] AI verification updates booking status
- [ ] Refund request updates booking to Cancelled
- [ ] All error messages are clear and informative

## Migration Notes

If converting from existing data without proper bookingId synchronization:

1. Backfill `bookingReference` for existing payments:
   ```javascript
   // Migration script
   db.payments.updateMany({}, 
     [{ $set: { bookingReference: { $concat: ["BK-", { $substr: ["$bookingId", 0, 8] }, "-", { $toString: { $millisecond: new Date() } }] } } }]
   )
   ```

2. Update `transactionId` unique index:
   ```javascript
   db.payments.createIndex({ transactionId: 1 }, { unique: true, sparse: true })
   ```

## Future Enhancements

1. Add webhook for payment gateway integration
2. Implement payment reconciliation service
3. Add audit logging for all status changes
4. Create payment analytics dashboard
5. Implement retry logic for failed payments
