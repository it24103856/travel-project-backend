# Quick Reference: Booking-Payment Synchronization

## API Endpoints Quick Guide

### For Customers

**Create Payment**
```bash
POST /api/payments/create
Authorization: Bearer TOKEN
{
  "bookingId": "65a1b2c3d4e5f6g7h8i9j0",
  "amount": 50000,
  "paymentMethod": "bank_transfer",
  "transactionId": "BNK-001-2024",
  "receiptUrl": "https://...",
  "paymentDetails": { ... }
}
```

**Get Payment Status for Booking**
```bash
GET /api/sync/booking/BOOKING_ID/payment-status
Authorization: Bearer TOKEN
```

**Get All Payments for Booking**
```bash
GET /api/sync/booking/BOOKING_ID/payments
Authorization: Bearer TOKEN
```

**Check if Payment Can Be Created**
```bash
POST /api/sync/validate-booking/BOOKING_ID
Authorization: Bearer TOKEN
```

### For Admins

**Get Complete Booking with Payments**
```bash
GET /api/sync/admin/booking/BOOKING_ID/full
Authorization: Bearer ADMIN_TOKEN
```

**Update Payment Status**
```bash
PUT /api/payments/admin/update-status/PAYMENT_ID
Authorization: Bearer ADMIN_TOKEN
{
  "status": "completed"  // or "failed", "refunded"
}
```

**Manual Sync Payment to Booking**
```bash
POST /api/sync/admin/sync-status
Authorization: Bearer ADMIN_TOKEN
{
  "paymentId": "65a1c3d4e5f6g7h8i9j0k1",
  "bookingId": "65a1b2c3d4e5f6g7h8i9j0",
  "action": "complete"  // or "cancel", "pending"
}
```

## Response Codes & Messages

### Success (2xx)
```
200 - OK: Query/Update successful
201 - Created: Payment created successfully
```

### Error (4xx)
```
400 - Bad Request: Missing/invalid fields
403 - Forbidden: Unauthorized access (not owner)
404 - Not Found: Booking/Payment not found
409 - Conflict: Duplicate transactionId
```

### Error (5xx)
```
500 - Server Error: Internal issues
```

## Data Structures

### Payment Response
```javascript
{
  _id: "payment_id",
  bookingId: "booking_id",
  bookingReference: "BK-ABC123XY-1707551234",
  userId: "user_id",
  amount: 50000,
  paymentStatus: "processing" | "completed" | "failed" | "refunded",
  transactionId: "BNK-001-2024",
  paymentMethod: "bank_transfer" | "card" | "crypto",
  createdAt: "2024-02-10T10:00:00Z",
  updatedAt: "2024-02-10T10:00:00Z"
}
```

### Booking Response
```javascript
{
  _id: "booking_id",
  userId: "user_id",
  hotelId: "hotel_id",
  status: "Pending" | "Confirmed" | "Cancelled",
  totalPrice: 50000,
  checkIn: "2024-02-15",
  checkOut: "2024-02-17",
  createdAt: "2024-02-10T10:00:00Z"
}
```

## Status Mapping

| Payment Status | → | Booking Status |
|---|---|---|
| processing | → | Pending |
| completed | → | Confirmed |
| failed | → | Pending |
| refunded | → | Cancelled |
| cancel_requested | → | Pending |

## Field Reference

| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| bookingId | ObjectId | "65a1b2c3d4e5f6g7h8i9j0" | Reference to Booking |
| bookingReference | String | "BK-65A1B2C-1707551234" | Human-readable tracking |
| transactionId | String | "BNK-001-2024" | Unique transaction identifier |
| paymentStatus | String | "completed" | Current payment state |
| amount | Number | 50000 | Payment amount |
| currency | String | "LKR" | Currency code |

## Database Queries

### Find Payment by BookingID
```javascript
db.payments.findOne({ bookingId: ObjectId("65a1b2c3d4e5f6g7h8i9j0") })
```

### Find All Payments by User
```javascript
db.payments.find({ userId: ObjectId("...") })
```

### Find Pending Payments
```javascript
db.payments.find({ paymentStatus: "processing" })
```

### Check Transaction ID Exists
```javascript
db.payments.findOne({ transactionId: "BNK-001-2024" })
```

## Common Issues & Fixes

### Issue: "Booking not found"
**Cause:** Invalid or non-existent bookingId
**Fix:** Verify bookingId format (24 hex chars) and booking exists

### Issue: "Transaction ID already exists"
**Cause:** Attempting to create payment with duplicate transactionId
**Fix:** Use unique transaction IDs for each payment

### Issue: "Unauthorized"
**Cause:** Booking doesn't belong to logged-in user
**Fix:** Verify user is owner of the booking

### Issue: Booking status not updating
**Cause:** Payment status update failed silently
**Fix:** Check admin token, verify payment exists, check logs

## Testing Checklist

- [ ] Create booking, get bookingId
- [ ] Create payment with valid bookingId
- [ ] Get payment status for booking
- [ ] Update payment status to completed
- [ ] Verify booking status is now "Confirmed"
- [ ] Try payment with invalid bookingId (should fail)
- [ ] Try duplicate transactionId (should fail)
- [ ] Query admin endpoint with full booking details
- [ ] Check all indexes exist on database

## Performance Tips

1. **Use indexes** - All queries already indexed
2. **Filter early** - Add paymentStatus filters to queries
3. **Paginate results** - For large payment lists
4. **Cache user bookings** - If frequently queried
5. **Monitor slow queries** - Set profiling threshold

## Documentation Files

| File | Purpose |
|------|---------|
| BOOKING_PAYMENT_SYNC.md | Architecture & design |
| TESTING_GUIDE.md | QA procedures & tests |
| MIGRATION_GUIDE.md | Data migration scripts |
| IMPLEMENTATION_SUMMARY.md | Complete overview |

## Service Functions (For Developers)

```javascript
// From bookingPaymentSyncService.js

// Validate booking before payment
const result = await validateBookingForPayment(bookingId, userId);

// Check if transaction ID is unique
const isUnique = await isTransactionIdUnique(transactionId);

// Get all payments for a booking
const payments = await getPaymentsByBookingId(bookingId);

// Sync payment status to booking
await syncPaymentStatusToBooking(paymentId, "completed");

// Get booking payment summary
const summary = await getBookingPaymentStatus(bookingId);

// Generate booking reference
const ref = generateBookingReference(bookingId);
```

## Key Environment Variables

- `Mongo_Url` - MongoDB connection string
- `JWT_SECRET` - JWT token secret key
- `VITE_BACKEND_URL` - Backend API URL (frontend)

## Deployment Checklist

- [ ] Backup existing MongoDB database
- [ ] Deploy new Payment model with indexes
- [ ] Deploy bookingPaymentSyncService.js
- [ ] Deploy updated paymentController.js
- [ ] Deploy new syncRoutes.js
- [ ] Update index.js with sync routes
- [ ] Run data migration (if existing data)
- [ ] Validate migration with provided script
- [ ] Run test suite from TESTING_GUIDE.md
- [ ] Monitor logs for errors
- [ ] Verify all endpoints working

## Support & Troubleshooting

For detailed information:
1. Check TESTING_GUIDE.md for testing procedures
2. Review BOOKING_PAYMENT_SYNC.md for architecture
3. Consult MIGRATION_GUIDE.md for data issues
4. See IMPLEMENTATION_SUMMARY.md for complete overview

## Key Facts

✅ BookingID is the primary synchronization key
✅ BookingReference provides human-readable tracking  
✅ TransactionID uniqueness prevents duplicate charges
✅ Status changes automatically sync between modules
✅ All changes are properly documented
✅ Ready for production deployment
