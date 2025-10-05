# API Documentation

This document provides comprehensive documentation for the Sorry App API endpoints.

## Authentication

The API uses cookie-based authentication. Before making authenticated requests, you must first sign in as a guest to receive a session cookie.

### Authentication Flow

1. Call `POST /api/auth/sign-in/guest` to create a session
2. The server will set a secure HTTP-only cookie (`apology_session`)
3. All subsequent requests automatically use this cookie for authentication

The fingerprint is generated server-side based on request metadata (IP address, user-agent) for enhanced security.

---

## Endpoints

### Authentication

#### Sign In as Guest

Creates a guest session and returns a fingerprint.

**Endpoint:** `POST /api/auth/sign-in/guest`

**Request:**
```http
POST /api/auth/sign-in/guest
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "fingerprint": "a1b2c3d4e5f6..."
}
```

**Status Codes:**
- `200` - Success
- `500` - Internal server error

---

### Messages

#### Get Rate Limit Maximum

Returns the maximum number of apology generations allowed per day.

**Endpoint:** `GET /api/messages/rate-limit`

**Request:**
```http
GET /api/messages/rate-limit
```

**Response:**
```json
{
  "max": 5
}
```

**Status Codes:**
- `200` - Success
- `500` - Internal server error

**Note:** This endpoint does not require authentication.

---

#### Get Remaining Generations

Returns the number of remaining apology generations for the authenticated user.

**Endpoint:** `GET /api/messages/remaining`

**Request:**
```http
GET /api/messages/remaining
Cookie: apology_session=...
```

**Response:**
```json
{
  "remaining": 3
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (invalid or missing session)
- `500` - Internal server error

---

#### Get Message

Retrieves a specific message by CID. The user must be the owner of the message.

**Endpoint:** `GET /api/messages/:cid`

**Request:**
```http
GET /api/messages/abc123
Cookie: apology_session=...
```

**Response:**
```json
{
  "cid": "abc123",
  "scenario": "I forgot her birthday",
  "content": "I am deeply sorry for forgetting your birthday...",
  "isPublic": false
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (invalid or missing session)
- `403` - Forbidden (user does not own this message)
- `404` - Message not found
- `500` - Internal server error

---

#### Toggle Message Publish Status

Toggles the public/private status of a message. The user must be the owner.

**Endpoint:** `POST /api/messages/toggle-publish`

**Request:**
```http
POST /api/messages/toggle-publish
Content-Type: application/json
Cookie: apology_session=...

{
  "cid": "abc123"
}
```

**Response:**
```json
{
  "isPublic": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing CID)
- `401` - Unauthorized (invalid or missing session)
- `403` - Forbidden (user does not own this message)
- `404` - Message not found
- `500` - Internal server error

---

#### Update Message Content

Updates the content of a message. The user must be the owner.

**Endpoint:** `PATCH /api/messages/:cid/content`

**Request:**
```http
PATCH /api/messages/abc123/content
Content-Type: application/json
Cookie: apology_session=...

{
  "content": "Updated apology message..."
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing content)
- `401` - Unauthorized (invalid or missing session)
- `403` - Forbidden (user does not own this message)
- `404` - Message not found
- `500` - Internal server error

---

#### Generate Apology

Generates an AI-powered apology message using streaming. Must be authenticated.

**Endpoint:** `POST /api/generate`

**Request:**
```http
POST /api/generate
Content-Type: application/json
Cookie: apology_session=...

{
  "cid": "abc123",
  "customPrompt": "Make it more emotional" // optional
}
```

**Response:**

Server-Sent Events (SSE) stream with the following event types:

```
data: {"type":"delta","content":"I am"}

data: {"type":"delta","content":" deeply"}

data: {"type":"delta","content":" sorry"}

data: {"type":"done"}
```

If already generated:
```
data: {"type":"content","content":"Full message text here"}
```

**Event Types:**
- `delta` - Partial content chunk
- `content` - Full content (when already generated)
- `done` - Generation complete
- `error` - Generation failed

**Status Codes:**
- `200` - Success (streaming response)
- `400` - Bad request (missing CID)
- `401` - Unauthorized (invalid or missing session)
- `404` - Message not found
- `500` - Internal server error

---

## Usage Examples

### Mobile App Flow

```javascript
// 1. Sign in as guest
const signInResponse = await fetch('/api/auth/sign-in/guest', {
  method: 'POST',
  credentials: 'include' // Important: include cookies
});
const { fingerprint } = await signInResponse.json();

// 2. Get rate limit info
const rateLimitResponse = await fetch('/api/messages/rate-limit', {
  credentials: 'include'
});
const { max } = await rateLimitResponse.json();

// 3. Check remaining generations
const remainingResponse = await fetch('/api/messages/remaining', {
  credentials: 'include'
});
const { remaining } = await remainingResponse.json();

// 4. Get a message
const messageResponse = await fetch('/api/messages/abc123', {
  credentials: 'include'
});
const message = await messageResponse.json();

// 5. Toggle publish status
const toggleResponse = await fetch('/api/messages/toggle-publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ cid: 'abc123' })
});
const { isPublic } = await toggleResponse.json();

// 6. Update message content
const updateResponse = await fetch('/api/messages/abc123/content', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ content: 'New content...' })
});
const { success } = await updateResponse.json();
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message here"
}
```

Common error messages:
- `"Unauthorized - invalid session"` - Session cookie is missing or invalid
- `"Unauthorized"` - User does not own the requested resource
- `"Message not found"` - The requested message does not exist
- `"CID is required"` - Missing required CID parameter
- `"Content is required"` - Missing required content parameter
- `"Internal server error"` - Server-side error occurred

---

## Security

- All authenticated endpoints verify ownership server-side
- Session cookies are HTTP-only and secure (in production)
- Fingerprints are signed using HMAC-SHA256
- Rate limiting is enforced per fingerprint
- CORS and CSRF protections are enabled

---

## Notes

- Cookie name: `apology_session`
- Cookie lifetime: 30 days
- Rate limit window: 1 day (fixed window)
- Maximum duration for `/api/generate`: 30 seconds
