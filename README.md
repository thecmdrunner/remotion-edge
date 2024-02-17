# Trying image gen via:

1. `@vercel/og` - When hosted on Vercel, it works fine except Vercel's caching sometimes breaks images when fetched and converted into blob using `fetch`. Works fine on Netlify though. OG images for some requests simply wouldn't come through on Vercel.

2. [`html-to-image`](https://www.npmjs.com/package/html-to-image) - Works well and supports all html elements and css properties. It uses canvas to convert html elements to image in various formats - png, jpeg, canvas, raw image pixelData, etc.

Does not support some css features like `backdrop-filter`.

An alternative is [use-react-screenshot](https://www.npmjs.com/package/use-react-screenshot) which uses `html2canvas` under the hood. It's just a react hook that's easier to use. May lack some features of `html-to-image`.

3. [Satori](https://github.com/vercel/satori) - Works for the most part, but has limited support for html elements and css properties. But a good fallback option since it works on edge functions and browsers too (Maintained by Vercel, so likely works well on iOS).

# "Roadmap" using Supabase?

- [Try Supabase edge functions for generating OG images](https://supabase.com/docs/guides/functions/examples/og-image)
- [Take screenshots of the browser using Puppeteer](https://supabase.com/docs/guides/functions/examples/screenshots)

# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
