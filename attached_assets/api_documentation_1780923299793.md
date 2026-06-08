# The GTW — API Documentation

## Overview

Base URL (production): `https://<your-app>.replit.app`  
Base URL (development): `https://<your-dev-domain>.replit.dev`

All authenticated endpoints require a Firebase ID token in the header:
```
Authorization: Bearer <firebase_id_token>
```

To get the token in a client:
```js
const token = await firebase.auth().currentUser.getIdToken();
```

**Currency note:** Wallet balance is stored in **kobo** (smallest Naira unit). Always divide by 100 before displaying (e.g. `50000 kobo = ₦500`). When sending compensation values for parcels, use major units (Naira).

---

## Authentication

### GET `/api/config/firebase`
Returns Firebase client configuration (safe to expose — public keys only).

**Response:**
```json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}
```

---

### POST `/api/auth/sync` 🔒
Syncs a Firebase-authenticated user into the database. Call this after every login/signup.

**Request body:**
```json
{
  "name": "Amara Kalu",
  "email": "amara@email.com",
  "phone": "+2348012345678"
}
```

**Response:** User object (see User schema below)

---

### GET `/api/auth/me` (optional auth)
Returns the current authenticated user's profile, or `null` if not logged in.

---

## Users

### POST `/api/users`
Create a new user record.

**Request body:**
```json
{
  "name": "Amara Kalu",
  "email": "amara@email.com",
  "phone": "+2348012345678",
  "firebaseUid": "abc123"
}
```

---

### GET `/api/users/:id`
Get a user by their ID.

---

### PATCH `/api/users/:id` 🔒
Update a user's profile.

**Request body (all fields optional):**
```json
{
  "name": "Amara Kalu",
  "phone": "+2348012345678",
  "bio": "Frequent Lagos–Abuja traveller",
  "profilePhoto": "https://...",
  "privacySettings": {}
}
```

---

### GET `/api/users/search?q=<query>`
Search users by name or email. Useful for selecting a receiver when creating a parcel.

**Query params:**
- `q` — search string (min 2 chars)

**Response:** Array of user objects

---

## Parcels

### GET `/api/parcels`
List parcels with optional filters.

**Query params:**
| Param | Description |
|-------|-------------|
| `senderId` | Filter by sender's user ID |
| `receiverId` | Filter by receiver's user ID |
| `transporterId` | Filter by carrier's user ID |
| `status` | `Pending`, `Paid`, `Accepted`, `Picked Up`, `In Transit`, `Arrived`, `Delivered`, `Expired` |
| `origin` | Filter by origin city/location |
| `destination` | Filter by destination city/location |

**Response:** Array of parcel objects with sender info joined

---

### GET `/api/parcels/:id`
Get a single parcel by ID.

---

### POST `/api/parcels` 🔒
Create a new parcel listing.

**Request body:**
```json
{
  "origin": "Lagos",
  "destination": "Abuja",
  "size": "medium",
  "weight": 2.5,
  "description": "Electronics",
  "specialInstructions": "Handle with care",
  "isFragile": true,
  "compensation": 3000,
  "pickupDate": "2026-07-01T10:00:00Z",
  "receiverId": "user_456",
  "receiverName": "Chidi Obi",
  "receiverPhone": "+2348099887766",
  "receiverEmail": "chidi@email.com",
  "intermediateStops": ["Ibadan", "Lokoja"]
}
```

**Parcel sizes:** `small`, `medium`, `large`, `extra-large`

---

### PATCH `/api/parcels/:id` 🔒
Update an existing parcel. Same fields as POST.

---

### PATCH `/api/parcels/:id/accept` 🔒
Carrier accepts a parcel for delivery. Sets status to `Accepted`.

**Request body:**
```json
{
  "transporterId": "carrier_user_id"
}
```

---

### DELETE `/api/parcels/:id` 🔒
Delete a parcel. Only the sender can delete their own parcel.

---

### GET `/api/parcels/:id/matching-routes`
Find carrier routes that match this parcel's origin/destination.

**Response:** Array of route objects

---

### GET `/api/parcels/:id/eta`
Get estimated delivery time using Haversine distance calculation.

**Response:**
```json
{
  "distanceKm": 520,
  "estimatedHours": 8,
  "estimatedArrival": "2026-07-01T18:00:00Z"
}
```

---

### GET `/api/parcels/:id/photos`
Get all pickup and delivery photos for a parcel.

---

### POST `/api/parcels/:id/photos/upload` 🔒
Upload a photo. Automatically updates parcel status:
- `pickup` photo → status becomes `In Transit`
- `delivery` photo → status becomes `Delivered`

**Request body (multipart or JSON with URL):**
```json
{
  "photoUrl": "https://...",
  "photoType": "pickup",
  "caption": "Collected from sender",
  "lat": 6.5244,
  "lng": 3.3792
}
```

---

## Live Tracking

### GET `/api/parcels/:id/carrier-location`
Get the carrier's last reported location.

**Response:**
```json
{
  "lat": 6.5244,
  "lng": 3.3792,
  "updatedAt": "2026-07-01T12:00:00Z"
}
```

---

### POST `/api/parcels/:id/carrier-location` 🔒
Carrier updates their current location.

**Request body:**
```json
{ "lat": 7.3776, "lng": 3.9470 }
```

---

### GET `/api/parcels/:id/receiver-location`
Get the receiver's shared location (if sharing is enabled).

---

### POST `/api/parcels/:id/receiver-location` 🔒
Receiver updates their location.

**Request body:**
```json
{ "lat": 9.0579, "lng": 7.4951 }
```

---

### PATCH `/api/parcels/:id/receiver-location` 🔒
Toggle receiver location sharing on/off.

**Request body:**
```json
{ "sharing": true }
```

---

## Messaging

### GET `/api/users/:userId/conversations`
List all conversations for a user, with latest message preview.

---

### GET `/api/conversations/:id` (optional auth)
Get a single conversation by ID.

---

### POST `/api/conversations`
Create a new conversation between two users about a parcel.

**Request body:**
```json
{
  "parcelId": 42,
  "participant1Id": "user_123",
  "participant2Id": "user_456"
}
```

---

### GET `/api/conversations/:id/messages`
Get all messages in a conversation.

---

### POST `/api/conversations/:id/messages` 🔒
Send a message in a conversation.

**Request body:**
```json
{ "text": "I'll be at your door by 3pm" }
```

---

### DELETE `/api/messages/:id`
Delete a message by ID.

---

### GET `/api/parcels/:parcelId/messages`
Get messages scoped to a specific parcel (alternative to conversation-based messaging).

---

### POST `/api/parcels/:parcelId/messages` 🔒
Send a message scoped to a parcel.

**Request body:**
```json
{ "text": "On my way!" }
```

---

## Carrier Routes

### GET `/api/routes`
List all saved carrier routes.

---

### GET `/api/routes/:id`
Get a single route.

---

### GET `/api/users/:userId/routes`
Get all routes saved by a specific user.

---

### POST `/api/routes` 🔒
Create a new route.

**Request body:**
```json
{
  "origin": "Lagos",
  "destination": "Abuja",
  "departureDate": "2026-07-05T08:00:00Z",
  "availableCapacity": "medium",
  "notes": "Weekly trip every Friday"
}
```

---

### PATCH `/api/routes/:id` 🔒
Update an existing route.

---

### DELETE `/api/routes/:id` 🔒
Delete a route.

---

### GET `/api/routes/:routeId/matching-parcels` 🔒
Find parcels that match a carrier's route origin/destination.

**Response:** Array of parcel objects

---

## Payments (Paystack)

### POST `/api/payments/initialize` 🔒
Start a Paystack checkout session for paying for a parcel.

**Request body:**
```json
{
  "parcelId": 42,
  "amount": 3000,
  "currency": "NGN",
  "email": "amara@email.com"
}
```

**Response:**
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "reference": "GTW_abc123"
}
```

Redirect the user to `authorization_url` to complete payment.

---

### GET `/api/payments/verify/:reference` 🔒
Verify a payment after the user returns from Paystack.

**Response:**
```json
{
  "status": "success",
  "amount": 300000,
  "parcelId": 42
}
```

---

### GET `/api/payments/history` 🔒
Get the current user's payment history.

---

### GET `/api/payments/:paymentId/receipt` 🔒
Get a receipt for a specific payment.

---

## Wallet

### GET `/api/wallet/balance` 🔒
Get wallet balance. **Value is in kobo — divide by 100 for Naira display.**

**Response:**
```json
{ "balance": 50000, "currency": "NGN" }
```
→ Display as ₦500.00

---

### GET `/api/wallet/transactions` 🔒
Get wallet transaction history.

---

### POST `/api/wallet/topup/initialize` 🔒
Start a Paystack top-up flow to add funds to the wallet.

**Request body:**
```json
{
  "amount": 5000,
  "currency": "NGN",
  "email": "amara@email.com"
}
```

**Response:** `{ "authorization_url": "...", "reference": "..." }`

---

### GET `/api/wallet/topup/verify/:reference` 🔒
Verify a top-up after the user returns from Paystack.

---

### GET `/api/auto-topup` 🔒
Get the user's auto top-up configuration.

---

### PATCH `/api/auto-topup` 🔒
Update auto top-up settings.

**Request body:**
```json
{
  "enabled": true,
  "threshold": 1000,
  "topupAmount": 5000
}
```

---

### GET `/api/payment-methods` 🔒
List saved payment methods (Paystack cards).

---

### POST `/api/payment-methods` 🔒
Add a new payment method.

---

### PATCH `/api/payment-methods/:id/default` 🔒
Set a payment method as the default.

---

### DELETE `/api/payment-methods/:id` 🔒
Remove a saved payment method.

---

## Reviews

### GET `/api/users/:userId/reviews`
Get all reviews for a user (as sender and as carrier).

**Response:**
```json
[
  {
    "id": 1,
    "rating": 5,
    "comment": "Very reliable carrier",
    "role": "carrier",
    "reviewerId": "user_123",
    "createdAt": "2026-06-01T10:00:00Z"
  }
]
```

---

### POST `/api/reviews` 🔒
Submit a review for a user after a completed delivery.

**Request body:**
```json
{
  "revieweeId": "user_456",
  "parcelId": 42,
  "rating": 5,
  "comment": "Great communication",
  "role": "carrier"
}
```

---

## Disputes

### GET `/api/disputes/me` 🔒
Get all disputes that involve the current user.

---

### GET `/api/disputes/:id` 🔒
Get a single dispute.

---

### POST `/api/disputes` 🔒
Open a dispute on a parcel.

**Request body:**
```json
{
  "parcelId": 42,
  "reason": "Package not delivered",
  "description": "The carrier marked it delivered but I never received it."
}
```

---

### GET `/api/disputes/:id/messages` 🔒
Get messages in a dispute thread.

---

### POST `/api/disputes/:id/messages` 🔒
Reply in a dispute thread.

**Request body:**
```json
{ "text": "I have photo proof of delivery." }
```

---

## Notifications

### GET `/api/notifications` 🔒
Get all notifications for the current user, newest first.

**Response:**
```json
[
  {
    "id": 1,
    "type": "parcel_accepted",
    "title": "Carrier Found!",
    "body": "Your parcel to Abuja has been accepted.",
    "read": false,
    "data": { "parcelId": 42 },
    "createdAt": "2026-06-08T10:00:00Z"
  }
]
```

---

### GET `/api/notifications/unread-count` 🔒
Get the number of unread notifications (for badge display).

**Response:** `{ "count": 3 }`

---

### PATCH `/api/notifications/:id/read` 🔒
Mark a single notification as read.

---

### PATCH `/api/notifications/read-all` 🔒
Mark all notifications as read.

---

### POST `/api/push-tokens` 🔒
Register a device push token (Expo Push Token) for push notifications.

**Request body:**
```json
{ "token": "ExponentPushToken[xxxxxx]" }
```

---

### DELETE `/api/push-tokens/:token` 🔒
Unregister a push token (e.g. on logout).

---

## Social / Connections

### GET `/api/users/:userId/connections`
List a user's connections.

---

### POST `/api/users/:userId/connections`
Add a connection.

**Request body:**
```json
{ "connectedUserId": "user_456" }
```

---

### DELETE `/api/users/:userId/connections/:connectedUserId`
Remove a connection.

---

### GET `/api/users/:userId/blocked` 🔒
Get the current user's blocked users list.

---

### POST `/api/users/:userId/blocked` 🔒
Block a user.

**Request body:**
```json
{ "blockedUserId": "user_789" }
```

---

### DELETE `/api/users/:userId/blocked/:blockedUserId` 🔒
Unblock a user.

---

## Subscriptions

### GET `/api/subscription` 🔒
Get the current user's subscription tier and status.

**Response:**
```json
{
  "tier": "pro",
  "status": "active",
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

---

### POST `/api/subscription/upgrade` 🔒
Upgrade subscription plan.

**Request body:**
```json
{ "plan": "pro" }
```

---

### POST `/api/subscription/cancel` 🔒
Cancel the current subscription.

---

## Miscellaneous

### GET `/api/geocode?address=<address>`
Geocode a text address to lat/lng coordinates.

**Response:**
```json
{
  "lat": 6.5244,
  "lng": 3.3792,
  "formatted": "Lagos, Nigeria"
}
```

---

### POST `/api/contact`
Submit a contact form message.

**Request body:**
```json
{
  "name": "Amara Kalu",
  "email": "amara@email.com",
  "message": "I have a question about..."
}
```

---

### POST `/api/complaints`
Submit a complaint.

**Request body:**
```json
{
  "subject": "Carrier no-show",
  "description": "...",
  "parcelId": 42
}
```

---

## Data Schemas

### User
```json
{
  "id": "firebase_uid",
  "name": "Amara Kalu",
  "email": "amara@email.com",
  "phone": "+2348012345678",
  "profilePhoto": "https://...",
  "rating": 4.8,
  "verified": true,
  "subscriptionStatus": "pro",
  "walletBalance": 50000,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

### Parcel
```json
{
  "id": 42,
  "origin": "Lagos",
  "destination": "Abuja",
  "intermediateStops": ["Ibadan"],
  "size": "medium",
  "weight": 2.5,
  "description": "Electronics",
  "specialInstructions": "Handle with care",
  "isFragile": true,
  "compensation": 3000,
  "pickupDate": "2026-07-01T10:00:00Z",
  "status": "Pending",
  "senderId": "user_123",
  "transporterId": null,
  "receiverId": "user_456",
  "receiverName": "Chidi Obi",
  "receiverPhone": "+2348099887766",
  "receiverEmail": "chidi@email.com",
  "createdAt": "2026-06-08T10:00:00Z"
}
```

**Parcel statuses (in order):**
`Pending` → `Paid` → `Accepted` → `Picked Up` → `In Transit` → `Arrived` → `Delivered`  
(or `Expired` if not accepted in time)

### Conversation
```json
{
  "id": 10,
  "parcelId": 42,
  "participant1Id": "user_123",
  "participant2Id": "user_456",
  "createdAt": "2026-06-08T10:00:00Z"
}
```

### Message
```json
{
  "id": 55,
  "conversationId": 10,
  "senderId": "user_123",
  "text": "On my way!",
  "createdAt": "2026-06-08T12:00:00Z"
}
```

---

## Error Responses

All errors follow this shape:
```json
{
  "error": "Parcel not found",
  "code": 404
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request / validation error |
| `401` | Missing or invalid auth token |
| `403` | Forbidden (not your resource) |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Push Notification Types

When using `POST /api/push-tokens` to register a device, the app will receive push notifications for the following events:

| Type | Trigger | Recipients |
|------|---------|------------|
| `parcel_accepted` | Carrier accepts a parcel | Sender, Receiver |
| `parcel_picked_up` | Pickup photo uploaded | Sender, Receiver |
| `parcel_delivered` | Delivery photo uploaded | Sender, Receiver |
| `new_message` | Message sent in conversation | All other participants |
| `incoming_parcel` | New parcel matches carrier route | Carrier |

Push notification payload data contains `parcelId` and/or `conversationId` for deep linking.
