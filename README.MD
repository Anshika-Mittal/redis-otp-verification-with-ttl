# OTP Verification API using Redis

A backend REST API built with **Node.js, Express.js, and Redis** to generate, store, verify, and expire One-Time Passwords (OTPs).

This project demonstrates how Redis can be used for temporary data storage using **key expiration (TTL)**, making it suitable for learning OTP-based authentication workflows.

## Tech Stack

- **Node.js** — JavaScript runtime
- **Express.js** — REST API framework
- **Redis** — In-memory key-value store
- **ioredis** — Redis client for Node.js

## Features

- Generate a random 6-digit OTP for a phone number.
- Store OTPs in Redis with a 60-second expiration.
- Verify OTPs against the stored values.
- Automatically expire OTPs using Redis TTL.
- Delete an OTP after successful verification.
- Validate phone number format and required request fields.
- Check the remaining lifetime of an OTP.

## How It Works

1. The client submits a phone number to request an OTP.
2. The server generates a 6-digit OTP.
3. Redis stores the OTP using a phone-specific key, such as `otp:9876543210`.
4. The OTP expires automatically after 60 seconds.
5. The client submits the phone number and OTP for verification.
6. If the OTP matches, it is deleted from Redis to prevent reuse.
7. The client can check the remaining expiration time using the TTL endpoint.

## Project Structure

```text
otp-verification/
├── src/
│   └── index.js
├── .gitignore
├── package.json
├── bun.lock
└── README.md
```

## Getting Started

### 1. Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- [Bun](https://bun.sh/) or npm
- [Redis](https://redis.io/)

Ensure your Redis server is running and accessible.

### 2. Clone the Repository

```bash
git clone https://github.com/Anshika-Mittal/redis-otp-verification-with-ttl.git
cd redis-otp-verification-with-ttl
```

Replace the repository URL if you use a different GitHub repository name.

### 3. Install Dependencies

Using Bun:

```bash
bun install
```

Or using npm:

```bash
npm install
```

### 4. Configure Redis

The application connects to `redis://localhost:6379` by default.

To use a different Redis instance, configure the `REDIS_URL` environment variable.

Example:

```env
REDIS_URL=redis://localhost:6379
```

If you store this variable in a `.env` file, load it using `dotenv` or configure the environment variable in your terminal. Do not commit `.env` files or Redis credentials to GitHub.

### 5. Start the Server

Run the script configured in your `package.json`. For example:

```bash
bun run dev
```

Or:

```bash
npm run dev
```

The server runs at:

`http://localhost:3000`

## API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/otp` | Generate and store an OTP |
| POST | `/otp/verify` | Verify an OTP |
| GET | `/otp/:phone/ttl` | Check the remaining OTP lifetime |

### 1. Generate an OTP

**Request**

```http
POST /otp
Content-Type: application/json
```

Request body:

```json
{
  "phone": "9876543210"
}
```

**Successful response**

```json
{
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

The OTP in this example is illustrative; the actual value is generated dynamically.

Redis operation:

```text
SET otp:9876543210 123456 EX 60
```

The `EX 60` option sets the key to expire after 60 seconds.

**Possible validation errors**

- `400 Bad Request` — phone number is missing.
- `400 Bad Request` — phone number is not exactly 10 digits.

### 2. Verify an OTP

**Request**

```http
POST /otp/verify
Content-Type: application/json
```

Request body:

```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Successful response**

```json
{
  "message": "OTP verified successfully"
}
```

When verification succeeds, the stored OTP is deleted from Redis.

Redis operations:

```text
GET otp:9876543210
DEL otp:9876543210
```

**Possible errors**

- `400 Bad Request` — phone number or OTP is missing.
- `400 Bad Request` — OTP has expired or does not exist.
- `400 Bad Request` — OTP is incorrect.

### 3. Check OTP Expiration Time

**Request**

```http
GET /otp/9876543210/ttl
```

**Example response**

```json
{
  "ttl": 42
}
```

The `ttl` value represents the remaining lifetime in seconds.

Redis operation:

```text
TTL otp:9876543210
```

Redis returns `-2` if the key does not exist and `-1` if the key exists without an expiration.

## Testing the API

You can use Postman or `curl` to test the endpoints.

**Generate an OTP**

```bash
curl -X POST http://localhost:3000/otp \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"9876543210\"}"
```

**Verify an OTP**

Replace `123456` with the OTP returned by the generation endpoint.

```bash
curl -X POST http://localhost:3000/otp/verify \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"9876543210\",\"otp\":\"123456\"}"
```

**Check the remaining TTL**

```bash
curl http://localhost:3000/otp/9876543210/ttl
```

## Redis Concepts Learned

- **Key-value storage:** Each phone number maps to an OTP stored under a Redis key.
- **Key naming conventions:** The `otp:` prefix helps organize OTP-related keys.
- **Expiration with TTL:** The `EX` option automatically removes OTPs after 60 seconds.
- **GET:** Retrieves an OTP for verification.
- **DEL:** Removes an OTP after successful verification.
- **TTL:** Returns the remaining lifetime of a stored key.
- **Temporary state management:** Redis stores short-lived verification data without requiring a permanent database record.

## Security Considerations

This project is intended for learning and is **not production-ready authentication software**.

Before using an OTP workflow in production:

- Deliver OTPs through a trusted SMS provider rather than returning them in API responses.
- Use a cryptographically secure random number generator.
- Add rate limiting for OTP generation and verification attempts.
- Limit repeated incorrect verification attempts.
- Avoid logging OTPs and sensitive phone numbers.
- Use HTTPS and secure environment-variable management.
- Consider atomic verification and deletion to prevent concurrent reuse.

## Future Improvements

- Integrate an SMS gateway for OTP delivery.
- Add rate limiting with Redis.
- Implement a maximum number of verification attempts.
- Add automated API tests.
- Use Docker Compose to run the API and Redis together.

## License

This project is intended for learning and experimentation.
