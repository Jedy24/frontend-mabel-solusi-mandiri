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
- The visit date is handled as a calendar date. Apply an entity-name search with Enter or the Search button. Other filters apply immediately. The Add Visit dialog has searchable Entity and Sales dropdowns. Entity search uses the API with a short delay and preserves history fallback. Sales search filters the loaded catalog locally.

## Known limitations

The prototype stores an eight-hour JWT in browser local storage. It uses one demo account, and the visit table scrolls horizontally on narrow screens. Filters reset when the page reloads. The API must be running for sign-in and visit management.

## AI Usage Disclosure

Codex assisted with most of the initial implementation, including the React routes, authentication, API clients, dashboard, and styling. The project author defined the requirements, reviewed the dashboard behavior, and reported the excessive search requests and the separate entity search field. Codex implemented the resulting search, dropdown, and loading-state changes. Verification included ESLint, the production build, and Chrome checks for search requests, dropdowns, visit creation, and mobile layout. A project-wide percentage was not measured.
