# Data Migration Guide: Booking-Payment Synchronization

## Overview
This guide provides scripts and instructions for migrating existing data to ensure proper BookingID-PaymentID synchronization.

## Pre-Migration Checklist

- [ ] Backup MongoDB database
- [ ] Backup application code
- [ ] Test migration on staging environment first
- [ ] Plan maintenance window
- [ ] Notify users of potential downtime
- [ ] Have rollback plan ready

## Migration Steps

### Step 1: Add bookingReference Field to Existing Payments

#### MongoDB Shell Script
```javascript
// Connect to your database
use travel_db;

// Generate bookingReference for payments that don't have it
db.payments.updateMany(
  { bookingReference: { $exists: false } },
  [
    {
      $set: {
        bookingReference: {
          $concat: [
            "BK-",
            { $substr: [{ $toString: "$bookingId" }, 0, 8] },
            "-",
            { $substr: [{ $toString: { $toLong: "$createdAt" } }, -6, 6] }
          ]
        }
      }
    }
  ]
);

// Verify update
db.payments.find({ bookingReference: { $exists: true } }).count();
```

#### Node.js Script Alternative
```javascript
// migration.js
import mongoose from 'mongoose';
import Payment from './models/Payment.js';

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Find all payments without bookingReference
    const paymentsToUpdate = await Payment.find({ 
      bookingReference: { $exists: false } 
    });
    
    console.log(`Found ${paymentsToUpdate.length} payments to migrate`);
    
    // Update each payment
    let updatedCount = 0;
    for (const payment of paymentsToUpdate) {
      const bookingRef = `BK-${payment.bookingId.toString().slice(0, 8).toUpperCase()}-${payment.createdAt.getTime().toString().slice(-6)}`;
      
      await Payment.findByIdAndUpdate(
        payment._id,
        { bookingReference: bookingRef }
      );
      
      updatedCount++;
      if (updatedCount % 100 === 0) {
        console.log(`Updated ${updatedCount}/${paymentsToUpdate.length}`);
      }
    }
    
    console.log(`✓ Migration complete! Updated ${updatedCount} payments`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
```

### Step 2: Create TransactionID Unique Index

#### MongoDB Shell Script
```javascript
// Create unique index on transactionId with sparse option
db.payments.createIndex(
  { transactionId: 1 },
  { unique: true, sparse: true }
);

// Verify index was created
db.payments.getIndexes();
```

### Step 3: Create/Verify BookingID Index

#### MongoDB Shell Script
```javascript
// Create index on bookingId for faster lookups
db.payments.createIndex(
  { bookingId: 1 },
  { background: true }
);

// Create compound index on bookingId and paymentStatus
db.payments.createIndex(
  { bookingId: 1, paymentStatus: 1 },
  { background: true }
);
```

### Step 4: Validate Database Integrity

#### Data Validation Script
```javascript
// validate-migration.js
import mongoose from 'mongoose';
import Payment from './models/Payment.js';
import Booking from './models/Booking.js';

async function validateMigration() {
  console.log('Starting validation...\n');
  
  try {
    // Check 1: All payments have bookingReference
    const paymentsWithoutRef = await Payment.countDocuments({ 
      bookingReference: { $exists: false } 
    });
    console.log(`[CHECK 1] Payments without bookingReference: ${paymentsWithoutRef}`);
    if (paymentsWithoutRef > 0) {
      console.warn('  ⚠️  Some payments still missing bookingReference!');
    } else {
      console.log('  ✓ All payments have bookingReference');
    }
    
    // Check 2: All bookingIds reference valid bookings
    const payments = await Payment.find().limit(1000);
    let invalidBookings = 0;
    
    for (const payment of payments) {
      const booking = await Booking.findById(payment.bookingId);
      if (!booking) {
        invalidBookings++;
        console.warn(`  ⚠️  Payment ${payment._id} references non-existent booking`);
      }
    }
    console.log(`\n[CHECK 2] Invalid bookingId references: ${invalidBookings}`);
    if (invalidBookings === 0) {
      console.log('  ✓ All payments reference valid bookings');
    }
    
    // Check 3: Transaction ID uniqueness
    const duplicates = await Payment.aggregate([
      { $match: { transactionId: { $ne: null } } },
      { $group: { _id: '$transactionId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    console.log(`\n[CHECK 3] Duplicate transactionIds: ${duplicates.length}`);
    if (duplicates.length > 0) {
      console.warn('  ⚠️  Found duplicate transaction IDs:');
      duplicates.forEach(d => console.warn(`    - ${d._id}: ${d.count} times`));
    } else {
      console.log('  ✓ All transactionIds are unique');
    }
    
    // Check 4: Sync status between payments and bookings
    const payments2 = await Payment.find({ paymentStatus: 'completed' }).limit(100);
    let syncErrors = 0;
    
    for (const payment of payments2) {
      const booking = await Booking.findById(payment.bookingId);
      if (booking && booking.status !== 'Confirmed') {
        syncErrors++;
        console.warn(`  ⚠️  Payment ${payment._id} completed but booking status is ${booking.status}`);
      }
    }
    console.log(`\n[CHECK 4] Status sync errors: ${syncErrors}`);
    if (syncErrors === 0) {
      console.log('  ✓ Payment and booking statuses are synchronized');
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    if (paymentsWithoutRef === 0 && invalidBookings === 0 && duplicates.length === 0 && syncErrors === 0) {
      console.log('✓ Migration validation PASSED');
    } else {
      console.log('✗ Migration validation FAILED - Review issues above');
    }
    
  } catch (error) {
    console.error('Validation error:', error);
  }
}

// Run validation
validateMigration();
```

### Step 5: Fix Issues if Found

#### Fix Duplicate TransactionIDs
```javascript
// identify-duplicates.js
import Payment from './models/Payment.js';

async function fixDuplicates() {
  const duplicates = await Payment.aggregate([
    { $match: { transactionId: { $ne: null } } },
    { $group: { 
      _id: '$transactionId', 
      payments: { $push: '$_id' },
      count: { $sum: 1 } 
    } },
    { $match: { count: { $gt: 1 } } }
  ]);
  
  console.log(`Found ${duplicates.length} duplicate transaction IDs\n`);
  
  for (const dup of duplicates) {
    console.log(`TransactionId: ${dup._id}`);
    console.log(`Payments: ${dup.payments.join(', ')}`);
    
    // Keep first, update others
    for (let i = 1; i < dup.payments.length; i++) {
      const newId = `${dup._id}-${i}`;
      await Payment.findByIdAndUpdate(dup.payments[i], {
        transactionId: newId
      });
      console.log(`  Updated payment ${dup.payments[i]} → ${newId}`);
    }
  }
}

// Run fix
fixDuplicates();
```

#### Fix Invalid BookingID References
```javascript
// fix-invalid-bookings.js
import Payment from './models/Payment.js';
import Booking from './models/Booking.js';

async function fixInvalidBookings() {
  const payments = await Payment.find();
  let fixedCount = 0;
  
  for (const payment of payments) {
    const booking = await Booking.findById(payment.bookingId);
    
    if (!booking) {
      console.warn(`Payment ${payment._id} has invalid bookingId`);
      // Option 1: Delete payment
      // await Payment.findByIdAndDelete(payment._id);
      
      // Option 2: Set to null (requires schema change)
      // await Payment.findByIdAndUpdate(payment._id, { bookingId: null });
      
      fixedCount++;
    }
  }
  
  console.log(`Found and processed ${fixedCount} invalid bookings`);
}

// Run fix
fixInvalidBookings();
```

## Rollback Procedure

If migration fails or issues are found:

### Option 1: Restore from Backup
```bash
# If using MongoDB container
docker-compose down
# Restore backup
mongorestore --archive=backup.archive
docker-compose up
```

### Option 2: Manual Rollback Script
```javascript
// rollback.js
import Payment from './models/Payment.js';

async function rollback() {
  try {
    console.log('Rolling back migration...');
    
    // Remove bookingReference field
    await Payment.updateMany(
      {},
      { $unset: { bookingReference: 1 } }
    );
    
    // Drop unique index on transactionId
    await Payment.collection.dropIndex('transactionId_1');
    
    console.log('✓ Migration rolled back');
  } catch (error) {
    console.error('Rollback failed:', error);
  }
}

rollback();
```

## Post-Migration Steps

### 1. Run Validation
```bash
node validate-migration.js
```

### 2. Monitor Logs
```bash
# Watch application logs
pm2 logs travel-backend

# Monitor database
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

### 3. Test Key Flows

#### Test 1: Create payment for existing booking
```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Authorization: Bearer TOKEN" \
  -d '{ "bookingId": "existing_id", "amount": 10000, ... }'
```

#### Test 2: Query payments by booking
```bash
curl http://localhost:3000/api/sync/booking/BOOKING_ID/payments \
  -H "Authorization: Bearer TOKEN"
```

#### Test 3: Update payment status
```bash
curl -X PUT http://localhost:3000/api/payments/admin/update-status/PAYMENT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{ "status": "completed" }'
```

### 4. Performance Tuning

#### Check Index Performance
```javascript
// Analyze index usage
db.payments.aggregate([
  { $match: { bookingId: ObjectId("...") } }
]).explain("executionStats")

// Should show index scan, not collection scan
```

#### Optimize Slow Queries
```javascript
// If slow, add covering index
db.payments.createIndex({
  bookingId: 1,
  paymentStatus: 1,
  createdAt: -1
})
```

## Timeline Estimate

| Step | Time | Notes |
|------|------|-------|
| Backup database | 5-15 min | Depends on data size |
| Add bookingReference | 5-30 min | Depends on payment count |
| Create indexes | 5-15 min | Background index creation |
| Validate data | 5-10 min | Run validation script |
| Fix issues (if any) | 10-30 min | Depends on data quality |
| Test flows | 10-20 min | Manual testing |
| **Total** | **40-120 min** | Typical migration time |

## Maintenance Notes

### Regular Backups
```bash
# Daily MongoDB backup
0 2 * * * mongodump --archive=backup-$(date +\%Y\%m\%d).archive
```

### Monitor Payment-Booking Sync
```javascript
// Weekly audit
db.payments.aggregate([
  {
    $lookup: {
      from: "bookings",
      localField: "bookingId",
      foreignField: "_id",
      as: "booking"
    }
  },
  { $match: { booking: { $eq: [] } } }  // Find orphaned payments
]).count()
```

## Support

For migration issues:
1. Check logs: `TESTING_GUIDE.md`
2. Verify indexes: `db.payments.getIndexes()`
3. Run validation: `node validate-migration.js`
4. Review Database: `db.payments.find().limit(10)`
