
# Firebase Cloud Functions Requirements

This document outlines the necessary Cloud Functions to ensure data integrity, atomicity, and to automate backend processes for the Aura Inventory Management System.

---

### 1. Atomic Stock Update (`onInwardOutwardAdjustmentCreate`)

-   **Trigger**: Firestore `onCreate` for `inward`, `outward`, and `adjustments` collections.
-   **Purpose**: To atomically update the master `stock` and `batches` documents whenever a stock movement occurs. This is the most critical function for maintaining accurate inventory counts.
-   **Logic**:
    1.  When a new document is created in `inward`, `outward`, or `adjustments`, the function triggers.
    2.  Use a **Firestore Transaction** to ensure atomicity.
    3.  Read the current `stock` document for the given `productId` and `warehouseId`.
    4.  Read the current `batch` document if applicable.
    5.  Calculate the new total quantity.
        -   For `inward`, `new_qty = current_qty + inward_qty`.
        -   For `outward`, `new_qty = current_qty - outward_qty`. Check for sufficient stock before committing. If stock is insufficient, throw an error to fail the transaction.
        -   For `adjustments`, `new_qty = current_qty + adjustment_qty`.
    6.  Update the `stock` document with the new quantity. Recalculate `avgCost` and `stockValue` for inwards.
    7.  Update the `batches` document with the new quantity for the specific batch and warehouse.
    8.  Commit the transaction.

---

### 2. Stock Reservation System (Optional, for advanced use cases)

-   **Trigger**: Callable Function (e.g., `reserveStock`).
-   **Purpose**: To reserve stock for an order before it is confirmed for outward shipment. This prevents overselling.
-   **Logic**:
    1.  Accepts `productId`, `warehouseId`, and `quantity` as arguments.
    2.  Runs a transaction on the `stock` document.
    3.  Checks if `(current_qty - current_reserved) >= requested_qty`.
    4.  If yes, `stock.reserved = stock.reserved + requested_qty`.
    5.  Commit transaction.
    6.  When the `outward` document is created, the `onInwardOutwardAdjustmentCreate` function should decrement both `quantity` and `reserved` fields.

---

### 3. Send Low-Stock Notifications (`onStockUpdate`)

-   **Trigger**: Firestore `onUpdate` for the `stock` collection.
-   **Purpose**: To notify managers or admins when stock for a product drops below its defined threshold.
-   **Logic**:
    1.  Function triggers when a `stock` document is updated.
    2.  Compare `change.before.data().quantity` and `change.after.data().quantity`.
    3.  Fetch the corresponding `product` document to get `lowStockThreshold`.
    4.  If `change.after.data().quantity` <= `product.lowStockThreshold` AND `change.before.data().quantity` > `product.lowStockThreshold`, then a notification should be sent.
    5.  Use **Firebase Cloud Messaging (FCM)** to send a push notification or an email (using a service like SendGrid) to a predefined list of admin/manager users.

---

### 4. Create Activity Log (`logActivity`)

-   **Trigger**: Firestore `onCreate`, `onUpdate`, `onDelete` on all major collections (`products`, `users`, `inward`, etc.). Can also be a callable function.
-   **Purpose**: To create a comprehensive audit trail of all actions.
-   **Logic**:
    1.  A generic function that takes `userId`, `activityType`, `referenceId`, and `details` as parameters.
    2.  It creates a new document in the `activityLogs` collection.
    3.  For `onUpdate` triggers, the function should compare `change.before.data()` and `change.after.data()` to generate a meaningful `details` string (e.g., "Updated product name from 'A' to 'B'").

---

### 5. Admin Invite Email (`onUserCreate`)

-   **Trigger**: Firestore `onCreate` for the `users` collection.
-   **Purpose**: When an admin adds a new user, this function sends them a welcome email with a link to set their password.
-   **Logic**:
    1.  Function triggers when a new user document is created.
    2.  Generate a password reset link using the **Firebase Admin Auth SDK**.
    3.  Use an email service (e.g., SendGrid, Mailgun) to send an email to the `user.email`.
    4.  The email should contain a welcome message and the password reset link.
