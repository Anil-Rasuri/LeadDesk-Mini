# LeadDesk Mini

LeadDesk Mini is a full-stack lead-capture product built for the Digital Heroes Full Stack Development qualification task.

## Live links

- Landing page: add after deployment
- Admin page: add `/admin/login` after deployment
- Backend API: add after deployment
- Loom walkthrough: add after recording

## Features

- Public landing page with a validated lead form
- Server-side validation with Pydantic
- Database-backed lead storage
- Admin login using bcrypt password hashing and JWT authentication
- Protected admin dashboard at `/admin`
- Lead search by name or email
- Status workflow: `New`, `Contacted`, `Closed`
- Responsive UI and mandatory Digital Heroes footer credit

## Data model

### `leads`

| Field | Type | Purpose |
|---|---|---|
| id | Integer | Primary key |
| name | String | Lead's name |
| email | String | Contact email |
| budget | String | Selected budget range |
| message | Text | Project requirement |
| status | String | New, Contacted or Closed |
| created_at | DateTime | Submission time |

### `admins`

| Field | Type | Purpose |
|---|---|---|
| id | Integer | Primary key |
| email | String | Unique admin login |
| password_hash | String | Bcrypt password hash |
| created_at | DateTime | Account creation time |

## Authentication approach

The admin account is created from environment variables during application startup. The password is hashed with bcrypt before it is stored in the database. Login returns a signed JWT containing the admin ID and expiration time. Protected admin endpoints require a valid Bearer token and verify that the referenced admin still exists in the database. No plain-text admin password is stored in the code or database.

## API contract

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/health` | Public | Deployment health check |
| POST | `/api/leads` | Public | Validate and create a lead |
| POST | `/api/admin/login` | Public | Authenticate an admin |
| GET | `/api/admin/me` | Admin | Validate the current token |
| GET | `/api/admin/leads?search=` | Admin | List or search leads |
| PATCH | `/api/admin/leads/{id}/status` | Admin | Update a lead's status |

## Local setup

### Backend

```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload
```

Open `http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd Frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Deployment

### Backend on Render

1. Push the project to GitHub.
2. Create a PostgreSQL database on Render or Supabase.
3. Create a Render Web Service with root directory `Backend`.
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `FRONTEND_URLS`.
7. After Netlify deployment, set `FRONTEND_URLS` to the exact Netlify URL.

### Frontend on Netlify

1. Import the GitHub repository.
2. Base directory: `Frontend`
3. Build command: `npm run build`
4. Publish directory: `Frontend/dist` if base is not set, otherwise `dist`.
5. Add `VITE_API_URL` with the Render backend URL.
6. Redeploy and test from an incognito browser.

## Three design decisions

1. **No public admin registration:** admin accounts are seeded through environment variables to reduce attack surface and keep the assessment focused.
2. **Validation on both sides:** the React form gives immediate feedback, while Pydantic remains the source of truth and prevents invalid direct API submissions.
3. **Search on the server:** the dashboard sends the search query to the backend so the same approach continues to work when the number of leads grows.

## AI usage

I used ChatGPT to pressure-test the project structure, review validation and authentication edge cases, and improve the deployment checklist. I then adapted the suggestions to my own FastAPI and React workflow, rewrote the interface and project decisions in my own style, and manually tested the complete lead flow before submission.

## Loom walkthrough checklist

1. Open the landing page in a fresh/incognito browser.
2. Trigger one client-side validation error.
3. Submit a valid lead.
4. Open `/admin/login` and sign in with the test credentials.
5. Show the new lead in the dashboard.
6. Search for the lead by name or email.
7. Change the status from New to Contacted and then Closed.
8. Briefly explain the `leads` and `admins` tables and JWT flow.
9. Mention one improvement for another day, such as pagination, refresh tokens or email notifications.

## Submission folder

Name the Google Drive folder `FullStackDevelopment_AnilRasuri` and include:

- A text document with the landing page, admin page, GitHub and Loom links
- Admin test credentials
- Any useful screenshots
- A short assumptions note

The live site footer includes the required linked credit: **Built for Digital Heroes Training Task**.
