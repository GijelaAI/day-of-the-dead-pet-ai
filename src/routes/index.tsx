import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your Site — A clean project scaffold" },
      { name: "description", content: "A TanStack Start + Cloudflare Workers starter project." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-4xl font-semibold text-amber-300">Your Site</h1>
      <p className="mt-4 max-w-md text-neutral-300">
        This is a TanStack Start + Cloudflare Workers scaffold. Replace the copy, add your
        routes, and deploy with <code className="rounded bg-neutral-800 px-1.5 py-0.5">pnpm deploy:prod</code>.
      </p>
    </main>
  );
}