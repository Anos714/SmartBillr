This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Credentials you (user) provide

Copy `.env.example` to `.env.local` (gitignored — never commit) and fill:

| Key | Where to get it |
| --- | --- |
| `DATABASE_URL` | Neon dashboard → your project → Connection string |
| `BETTER_AUTH_SECRET` | Generated via `openssl rand -base64 32` (already set; length 44) |
| `BETTER_AUTH_URL` | `http://localhost:3000` locally |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth client (Web). Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary dashboard → API keys |
| Dodo keys (`DODO_*`) | Dodo Payments dashboard (next step; optional for now) |

Guest mode (marketing, editor, assets via dataURL) works with empty
Google/Cloudinary keys — the UI shows a "setup pending" note instead of
breaking the build.

After filling `DATABASE_URL`, run migrations against Neon:

```bash
bun run db:generate
bun run db:migrate
```
