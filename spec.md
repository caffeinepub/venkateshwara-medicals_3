# Venkateshwara Medicals

## Current State
Admin panel has a CUSTOMER ORDERS tab showing orders from localStorage. Orders have 3 statuses: pending, confirmed, delivered. Status is display-only -- admin cannot change it.

## Requested Changes (Diff)

### Add
- Status options: pending, processing, completed, cancelled
- Dropdown in the orders table Status column for admin to change order status
- Persist status changes back to localStorage

### Modify
- StatusBadge to support all 4 statuses with distinct colors
- Orders stats card to reflect new statuses
- LocalOrder type to use new 4-option union

### Remove
- "confirmed" and "delivered" status values (replaced by processing/completed)

## Implementation Plan
1. Update LocalOrder status type to `pending | processing | completed | cancelled`
2. Update StatusBadge colors for all 4 statuses
3. Add saveOrdersToLocalStorage helper
4. Add useState for mutable orders list
5. Add handleStatusChange function that updates state + localStorage
6. Replace static StatusBadge in table with a Select dropdown for admin
7. Update order stats cards to show new status breakdowns
