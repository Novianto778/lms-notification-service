# Notification Service

A microservice for handling real-time notifications in the LMS system. This service manages user notifications through REST API endpoints, WebSocket connections, and Server-Sent Events (SSE) for real-time updates.

## Features

- Multiple real-time notification delivery methods:
  - Server-Sent Events (SSE) for efficient one-way real-time updates
  - WebSocket for bi-directional communication
  - REST API for traditional HTTP requests
- Kafka integration for event-driven notifications
- Authentication middleware for secure access
- Notification status tracking (read/unread/archived)
- Support for various notification types
- Metadata support for additional context
- Health monitoring endpoint

## Technical Stack

- Node.js & Express
- Server-Sent Events (SSE)
- WebSocket (Socket.IO)
- Kafka for event streaming
- Prisma ORM
- PostgreSQL database

## API Endpoints

### Real-time Notifications

#### SSE Connection

```typescript
GET / api / notifications / stream;
```

Establishes a Server-Sent Event connection for real-time notifications.

- **Authentication**: Required (JWT token in Authorization header)
- **Response**: EventStream
- **Events**:
  - `notification`: New notification data
  - `read-receipt`: Notification read status update
  - `error`: Error event

Example client usage:

```javascript
const eventSource = new EventSource('/api/notifications/stream', {
  headers: {
    Authorization: 'Bearer your-jwt-token',
  },
});

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Received notification:', notification);
};

eventSource.addEventListener('read-receipt', (event) => {
  const readReceipt = JSON.parse(event.data);
  console.log('Notification read status:', readReceipt);
});

eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
  // Implement reconnection logic if needed
};
```

### REST Endpoints

#### Get User Notifications

```typescript
GET / api / notifications;
```

#### Mark Notification as Read

```typescript
PUT /api/notifications/:id/read
```

#### Update Notification

```typescript
PUT /api/notifications/:id
```

### Events

- `notification:new`: Emitted when a new notification is created
- `notification:updated`: Emitted when a notification is updated
- `notification:read`: Emitted when a notification is marked as read

## Notification Types

```typescript
enum NotificationType {
  COURSE_CREATED = 'COURSE_CREATED',
  COURSE_UPDATED = 'COURSE_UPDATED',
  ENROLLMENT_CONFIRMED = 'ENROLLMENT_CONFIRMED',
  NEW_COMMENT = 'NEW_COMMENT',
  ASSIGNMENT_POSTED = 'ASSIGNMENT_POSTED',
  GRADE_POSTED = 'GRADE_POSTED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}
```

## Data Models

### Notification Schema

```typescript
{
  id: string;          // UUID
  userId: string;      // UUID of recipient
  type: NotificationType;
  title: string;       // Max 255 characters
  message: string;     // Text content
  status: NotificationStatus;
  metadata?: Record<string, any>; // Optional additional data
  readAt?: Date;       // Timestamp when read
  createdAt: Date;     // Creation timestamp
  updatedAt: Date;     // Last update timestamp
}
```

## WebSocket Events

### Connection

```typescript
// Connect with authentication
socket.connect('ws://service-url', {
  auth: {
    token: 'JWT_TOKEN',
  },
});
```

### Events

- `notification:new`: Emitted when a new notification is created
- `notification:updated`: Emitted when a notification is updated
- `notification:read`: Emitted when a notification is marked as read

## Environment Variables

```env
PORT=3000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://user:password@localhost:5432/db
KAFKA_BROKERS=localhost:9092
SSE_HEARTBEAT_INTERVAL=30000
```

## Security Considerations

### Content Security Policy (CSP)

The service implements a secure CSP configuration that allows SSE connections while maintaining security:

```typescript
// CSP Configuration
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", process.env.CORS_ORIGIN],
    // ... other directives
  }
}
```

### SSE Best Practices

1. **Reconnection**: Implement client-side reconnection logic
2. **Authentication**: Always validate JWT tokens for SSE connections
3. **Resource Management**: Close inactive connections
4. **Error Handling**: Proper error events and status updates

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Start the service:

```bash
npm run dev
```

## Production Deployment

```bash
npm run build
npm start
```

## Monitoring

The service includes built-in monitoring through the `/health` endpoint and logging configuration for production environments.

### SSE Connection Monitoring

Monitor SSE connections and performance using the built-in metrics:

- Active SSE connections
- Connection duration
- Message delivery rates
- Error rates

Access these metrics via the `/metrics` endpoint (when enabled).

## Error Handling

The service includes standardized error responses:

```typescript
{
  status: number;    // HTTP status code
  message: string;   // Error message
  errors?: any[];    // Optional validation errors
}
```

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

## License

[MIT](LICENSE)
