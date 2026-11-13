# Visit Flow Frontend

Visit Flow gives field teams a dashboard for planning visits and tracking their status. Filters, entity choices, and visit updates use the separate Visit Flow REST API.

## Run locally

Use Node.js 22.12+ and npm. Start the backend and seed its database using the backend README. From this repository, run:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

On macOS and Linux, use `cp .env.example .env`. Open [Visit Flow](http://localhost:5173) and sign in as **demo@visitflow.test** with **Demo12345!**.

Set `VITE_API_URL` in `.env` to the backend API base URL. Its local default is `http://localhost:3001/api`. The backend's `FRONTEND_URL` must match the origin you use to open the frontend.

```sh
npm run lint
npm run build
```

## Pages

| Route    | Purpose                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/login` | Demo sign-in, with loading and error feedback.                                                                                                                      |
| `/`      | Visit Management dashboard with filtered totals, visit search, date range and status filters, entity selection, visit creation, and status updates. Requires login. |

The dashboard requests matching rows from the API and derives its summary counts from those rows. The Add Visit dialog loads entities for the selected segment. Searching for **Cemara** in **B2G** demonstrates the history fallback when master data has no matching entity.

## Stack and decisions

- React handles UI state and reusable components. React Router guards the dashboard. Vite provides a local dev server and a production build.
- Axios centralizes the API origin, Bearer authentication, timeouts, cancellation, and expired-session handling.
- Tailwind CSS supplies utilities for spacing and layout. Lucide React supplies the interface icons. ESLint and Prettier enforce consistent source conventions.
- The visit date is handled as a calendar date. Search is debounced, and requests are canceled when newer filters supersede them.

## Known limitations

The prototype stores an eight-hour JWT in browser local storage. It uses one demo account, and the visit table scrolls horizontally on narrow screens. Filters reset when the page reloads. The API must be running for sign-in and visit management.

## AI Usage Disclosure

Estimated AI assistance is approximately **100% of this repository's implementation during the recorded session**. Codex authored the React routes, authentication and API clients, visit dashboard, forms, styling, configuration, and documentation from the supplied requirements. Codex reviewed the implementation and ran lint, the production build, and a Chrome smoke check covering sign-in, filtered totals, entity fallback, creation, both status changes, reload persistence, the mobile layout, and logout. Candidate manual review and test verification are unrecorded for this session.
