# SafeHer Backend – Emergency Safety API

SafeHer Backend is the server-side API powering SafeHer 2.0, a women safety mobile application built using Expo React Native.

The backend handles user authentication, emergency SOS processing, location synchronization, trusted contact support, push notification workflows, and emergency check-ins.

---

## Features

### Authentication

* User registration
* User login
* Session authentication
* Secure token handling

### Emergency SOS Workflow

* Community SOS request processing
* Emergency event handling
* Live emergency coordination

### Location Management

* User location synchronization
* Real-time location updates
* GPS coordinate storage

### Push Notifications

* Expo push token storage
* Nearby emergency alert notifications
* Community assistance workflows

### Check-In System

* User safety check-ins
* Safety verification endpoints

### Database Management

* MongoDB Atlas integration
* User data storage
* Emergency records persistence

---

## Tech Stack

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* REST APIs

---

## Project Structure

```txt
SafeHer-backend/
│── src/
│── server.js
│── package.json
│── .env.example
│── README.md
```

---

## API Endpoints

### Health Check

* GET /health

### Authentication APIs

* POST /auth/register
* POST /auth/login

### User APIs

* POST /users/updateLocation
* POST /users/savePushToken

### SOS APIs

* POST /sos/community

### Alerts APIs

* POST /alerts/checkin

---

## Frontend Integration

Frontend Repository:

https://github.com/Riddhi-Patil/safeher-2.0

The frontend application communicates with this backend for:

* Authentication
* Location synchronization
* SOS activation
* Push notifications
* Community safety workflows

---

## Environment Variables

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

---

## Setup & Installation

### Clone Repository

```bash
git clone https://github.com/Riddhi-Patil/SafeHer-backend.git
cd SafeHer-backend
```

### Install Dependencies

```bash
npm install
```

### Run Project

```bash
npm start
```

---

## Backend Workflow

1. User authenticates through frontend.
2. Backend validates credentials.
3. User location updates are stored.
4. SOS requests are processed.
5. Nearby users receive push notifications.
6. Check-in requests are validated.

---

## Future Improvements

* Role-based access control
* Emergency analytics dashboard
* Background job queues
* AI-based incident detection
* Improved notification targeting

---

## Developed By

Riddhi Bhaskar Patil

---

## License

Developed for academic and educational purposes.
