# Jurisdesk

JurisDesk is a legal case-management app for advocates. It brings case tracking, client records, hearing schedules, documents, and follow-up tasks into one workspace.

## Built with

React, Node.js, Express, MongoDB, and JWT authentication.

## Run locally

Requires Node.js 18+ and MongoDB (local or Atlas).

1. In `server/`, copy `.env.example` to `.env`, set `JWT_SECRET` and `MONGODB_URI`, then run `npm install`, `npm run seed`, and `npm run dev`.
2. In a second terminal, open `client/` and run `npm install` and `npm run dev`.
3. Open the client URL shown in the terminal.

Demo sign-in: `demo@jurisdesk.in` / `Demo@12345`
