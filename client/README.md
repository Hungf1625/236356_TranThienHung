# Food menu frontend

## Run locally

Start the backend on port `5000`, then run the frontend:

```bash
npm install
npm run dev
```

In development, Vite proxies `/api` requests to `http://localhost:5000`. For a deployed frontend, set `VITE_API_URL` to the backend food endpoint, such as `https://your-backend.example.com/api/foods`.

The page supports listing and searching foods, creating and editing a food, viewing its details, and deleting it. New foods receive their `foodId` from the backend.
