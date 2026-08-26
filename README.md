# QUT Helpdesk — IT Support Ticket System

Ticketing application for IT support requests. 
- End users submit and track tickets
- support agents triage a shared queue, claim tickets, and work them through to resolution. 

Built with a React frontend and an Express/MongoDB backend, using JWT authentication and role-based access control.

## Features

**End User**
- Register and log in (role selected at sign-up)
- Submit a support ticket (title, description, category, priority)
- View a personal ticket list with status, priority, and last-updated date
- View a ticket's full detail, including comments
- Edit or delete a ticket while it's still `Open` and unassigned
- Post and delete their own comments
- Reopen a `Resolved` ticket if the issue isn't actually fixed

**Support Agent**
- Register and log in (role selected at sign-up)
- View a shared ticket queue across all users, with filters for status, priority, and assignment
- Claim ("assign to me") an unassigned ticket, which moves it to `In Progress`
- Move a ticket through the status workflow: `Open → In Progress → Resolved → Closed`
- Provide a resolution note (required before resolving or closing)
- Post and delete their own comments
- Cannot edit ticket content, delete tickets, or change any account's role

## Tech Stack

- **Frontend:** React 18, React Router v6, Tailwind CSS, Axios
- **Backend:** Node.js, Express, Mongoose (MongoDB)
- **Auth:** JWT (JSON Web Tokens), bcrypt password hashing
- **Database:** MongoDB Atlas

## Prerequisites

- [Node.js](https://nodejs.org/en) (v18+ recommended)
- [Git](https://git-scm.com/)
- A [MongoDB Atlas](https://account.mongodb.com/account/login) cluster (or a local MongoDB instance)

## Project Structure

```
IT-Support/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/      # Route handlers (auth, tickets, comments)
│   ├── middleware/       # JWT auth middleware
│   ├── models/           # Mongoose schemas (User, Ticket, Comment)
│   ├── routes/           # Express routers
│   └── server.js
└── frontend/
    └── src/
        ├── components/    # Reusable UI (forms, lists, nav, route guard)
        ├── context/       # AuthContext (login state, localStorage persistence)
        └── pages/         # Routed pages (Login, Register, Tickets, Queue, etc.)
```

## Setup & Installation

Clone the repository, then set up each side:

```bash
git clone https://github.com/Kuwakou/IT_Support_System.git
cd IT_Support_System
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see [Environment Variables](#environment-variables) below — this file is gitignored and must never be committed).

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

The app runs on `http://localhost:3000` and expects the backend at the URL configured in `frontend/src/axiosConfig.jsx`.


## Deployment

Deployment to an EC2 instance is in progress. The app currently runs locally only (see Setup above). `frontend/src/axiosConfig.jsx` has a commented-out `baseURL` line for pointing the frontend at a deployed backend once that's live.

## Known Limitations

Out of scope for this project: email/push notifications, file attachments, SLA timers, reporting dashboards, a knowledge base, admin screens for managing other users' roles, single sign-on, and a native mobile app. There is no automated test suite; features are verified manually.
