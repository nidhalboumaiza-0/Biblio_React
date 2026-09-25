# Biblio React

TypeScript frontend for a library management platform. The interface covers books, authors, members, borrowing activity, authentication, and dashboard reporting against the Flask API.

## Features

- Library dashboard and activity charts
- Book, author, and member management
- Borrowing and return workflows
- Authenticated routes and persistent session state
- Responsive notifications and form validation

## Tech Stack

- React, TypeScript, and Vite
- React Router and Axios
- TanStack Query and Zustand
- Chart.js, React Hook Form, and Tailwind CSS

## Run Locally

1. Install Node.js 18 or newer.
2. Start the `Biblio_Flask` backend on `http://localhost:5000`. The current frontend source calls that address directly.
3. Open a terminal in this repository and install the dependencies:

   ```bash
   npm install
   ```

4. Start the Vite development server:

   ```bash
   npm run dev
   ```

5. Open the URL printed by Vite, normally `http://localhost:5173`.

If the Flask API runs on another host or port, update the `http://localhost:5000` URLs under `src/` before launching the client.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```
