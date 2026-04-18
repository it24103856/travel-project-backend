# Booking-Payment Synchronization Testing Guide

## Quick Test Commands

### 1. Test Booking Creation
```bash
# Create a test booking
curl -X POST http://localhost:3000/api/bookings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "hotelId": "HOTEL_ID",
    "userId": "USER_ID",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+94701234567",
    "country": "Sri Lanka",
    "checkIn": "2024-02-15",
    "checkOut": "2024-02-17",
    "roomType": "Standard",
    "adults": 2,
    "children": 0,
    "totalPrice": 50000,
    "status": "Pending"
  }'

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "_id": "65a1b2c3d4e5f6g7h8i9j0",  <- BOOKING ID
#     "hotelId": "...",
#     "status": "Pending",
#     ...
#   }
# }
```

### 2. Test Payment Creation with Valid BookingID
```bash
# Create payment for previously created booking
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bookingId": "65a1b2c3d4e5f6g7h8i9j0",
    "amount": 50000,
    "paymentMethod": "bank_transfer",
    "transactionId": "TRX-2024-001",
    "paymentDetails": {
      "bankName": "Bank of Ceylon",
      "paymentDate": "2024-02-10T10:00:00Z",
      "paidAmount": 50000
    }
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Payment submitted successfully",
#   "paymentId": "65a1c3d4e5f6g7h8i9j0k1",
#   "bookingReference": "BK-65A1B2C-1707551234",  <- BOOKING REFERENCE
#   "paymentStatus": "processing"
# }
```

### 3. Test Invalid BookingID (Should Fail)
```bash
# Try to create payment with non-existent booking
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bookingId": "invalid_id_12345678",
    "amount": 50000,
    "paymentMethod": "bank_transfer"
  }'

# Expected Response (404):
# {
#   "success": false,
#   "message": "Booking not found. Invalid bookingId."
# }
```

### 4. Test Duplicate TransactionID (Should Fail)
```bash
# Try to create payment with duplicate transaction ID
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bookingId": "65a1b2c3d4e5f6g7h8i9j0",
    "amount": 50000,
    "paymentMethod": "bank_transfer",
    "transactionId": "TRX-2024-001"  <- Already exists
  }'

# Expected Response (409):
# {
#   "success": false,
#   "message": "Transaction ID already exists. Possible duplicate payment.",
#   "isDuplicate": true
# }
```

### 5. Test Payment Status Update
```bash
# Update payment status (triggers booking sync)
curl -X PUT http://localhost:3000/api/payments/admin/update-status/PAYMENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "completed"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Payment and Booking status updated",
#   "bookingReference": "BK-65A1B2C-1707551234"
# }

# Verify booking status changed
curl -X GET http://localhost:3000/api/bookings/get/BOOKING_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Booking status should now be "Confirmed"
```

### 6. Test Payment History Query
```bash
# Get all payments for a booking
curl -X GET http://localhost:3000/api/sync/booking/BOOKING_ID/payments \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "count": 1,
#   "data": [
#     {
#       "_id": "65a1c3d4e5f6g7h8i9j0k1",
#       "bookingId": "65a1b2c3d4e5f6g7h8i9j0",
#       "bookingReference": "BK-65A1B2C-1707551234",
#       "amount": 50000,
#       "paymentStatus": "processing",
#       ...
#     }
#   ]
# }
```

### 7. Test Payment Status Query
```bash
# Get payment status for a booking
curl -X GET http://localhost:3000/api/sync/booking/BOOKING_ID/payment-status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "bookingId": "65a1b2c3d4e5f6g7h8i9j0",
#     "bookingStatus": "Pending",
#     "paymentInfo": {
#       "hasPayment": true,
#       "latestPaymentStatus": "processing",
#       "isPaymentCompleted": false,
#       "totalPaymentRecords": 1
#     }
#   }
# }
```

### 8. Test Admin Booking Full Details
```bash
# Get complete booking with payment info (admin only)
curl -X GET http://localhost:3000/api/sync/admin/booking/BOOKING_ID/full \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "booking": {
#       "_id": "65a1b2c3d4e5f6g7h8i9j0",
#       "status": "Confirmed",
#       "totalPrice": 50000,
#       "userId": { ... },
#       "hotelId": { ... }
#     },
#     "payments": [ ... ],
#     "summary": {
#       "totalPayments": 1,
#       "totalAmountPaid": 50000,
#       "paymentStatus": "processing",
#       "bookingStatus": "Confirmed"
#     }
#   }
# }
```

## End-to-End Test Scenario

### Scenario: Complete Booking-Payment Flow

#### Step 1: User Creates Booking
```
User fills booking form → Click "Book Now"
↓
Frontend POST /api/bookings/create
↓
Backend creates Booking with status="Pending"
↓
Returns bookingId: "ABC123XYZ"
↓
Frontend receives and navigates to payment page with state: { bookingId: "ABC123XYZ" }
```

#### Step 2: User Selects Payment Method
```
Payment page displays bookingId
↓
User selects "Bank Transfer"
↓
Navigates to BankTransferPage with state: { bookingId: "ABC123XYZ", amount: 50000 }
```

#### Step 3: User Submits Payment
```
User fills bank details
User uploads receipt
User enters transactionId: "BNK-001-2024"
↓
Frontend POST /api/payments/create
{
  bookingId: "ABC123XYZ",
  amount: 50000,
  paymentMethod: "bank_transfer",
  transactionId: "BNK-001-2024",
  receiptUrl: "..."
}
↓
Backend validates:
  - bookingId exists ✓
  - booking belongs to user ✓
  - transactionId is unique ✓
↓
Backend creates Payment with:
  - bookingId: "ABC123XYZ"
  - bookingReference: "BK-ABC123XY-1707551234"
  - paymentStatus: "processing"
↓
Frontend receives response with bookingReference
↓
Shows success message with bookingReference
```

#### Step 4: Admin Reviews Payment
```
Admin views pending payments
↓
Click on payment with bookingReference: "BK-ABC123XY-1707551234"
↓
Shows associated booking details
```

#### Step 5: Admin Approves Payment
```
Admin verifies receipt
↓
Admin clicks "Approve"
↓
Backend PUT /api/payments/admin/update-status/PAYMENT_ID
  { status: "completed" }
↓
Backend updates Payment status → "completed"
↓
Backend calls syncPaymentStatusToBooking()
↓
Backend updates associated Booking status → "Confirmed"
↓
Frontend shows "Payment Approved - Booking Confirmed"
```

#### Step 6: Customer Checks Payment
```
Customer views my-payments
↓
Shows all payments with bookingReference
↓
Each payment linked to booking details
↓
Status shows "Completed" and booking shows "Confirmed"
```

## Database Query Verification

### Query 1: Verify Payment-Booking Link
```javascript
// In MongoDB shell
db.payments.findOne({ _id: ObjectId("PAYMENT_ID") })

// Should return:
{
  _id: ObjectId("65a1c3d4e5f6g7h8i9j0k1"),
  bookingId: ObjectId("65a1b2c3d4e5f6g7h8i9j0"),  // <- Correctly references booking
  bookingReference: "BK-65A1B2C-1707551234",
  userId: ObjectId("..."),
  transactionId: "BNK-001-2024",
  paymentStatus: "completed",
  ...
}
```

### Query 2: Verify Booking Status Sync
```javascript
// In MongoDB shell
db.bookings.findOne({ _id: ObjectId("65a1b2c3d4e5f6g7h8i9j0") })

// Should return:
{
  _id: ObjectId("65a1b2c3d4e5f6g7h8i9j0"),
  userId: ObjectId("..."),
  status: "Confirmed",  // <- Updated after payment completed
  totalPrice: 50000,
  ...
}
```

### Query 3: Verify TransactionID Uniqueness
```javascript
// In MongoDB shell
db.payments.findOne({ transactionId: "BNK-001-2024" })

// Should return only ONE document
// Trying to insert duplicate transactionId should fail
```

### Query 4: Get All Payments for Booking
```javascript
// In MongoDB shell
db.payments.find({ bookingId: ObjectId("65a1b2c3d4e5f6g7h8i9j0") })

// Should return all payments for this booking in order
```

## Expected Behavior Summary

| Action | Input | Expected Output | Status |
|--------|-------|-----------------|--------|
| Create Booking | Hotel ID, dates | Booking with _id | ✓ |
| Pass BookingID to Payment | BookingID | Navigation with state | ✓ |
| Create Payment (valid) | BookingID, amount | Payment created, bookingReference returned | ✓ |
| Create Payment (invalid bookingId) | Invalid ID | 404 error | ✓ |
| Create Payment (duplicate transactionId) | Duplicate ID | 409 error | ✓ |
| Update Payment Status | Payment ID, status | Booking status synced | ✓ |
| Query Payment by BookingID | BookingID | All payments returned | ✓ |
| Query Booking Status | BookingID | Status matches payment | ✓ |

## Troubleshooting

### Issue: Booking not found when creating payment
**Solution:** Verify bookingId format is valid MongoDB ObjectId (24 hex characters)

### Issue: TransactionID showing as duplicate
**Solution:** Use unique transaction IDs, don't reuse for multiple payments

### Issue: Booking status not updating after payment
**Solution:** Check admin token has isAdmin permission, verify payment.bookingId exists

### Issue: BookingReference not generated
**Solution:** Ensure bookingId is valid ObjectId at payment creation time

## Performance Monitoring

### Key Metrics to Monitor
1. **Payment Creation Time**: Should be < 2 seconds
2. **Booking Sync Time**: Should be < 1 second
3. **Query Response Time**: Should be < 500ms
4. **Database Indexes**: Verify index on bookingId and transactionId

### Monitoring Queries
```javascript
// Check slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(10)

// Check indexes
db.payments.getIndexes()
```
