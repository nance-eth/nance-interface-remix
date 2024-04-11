import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import tailwindStylesHref from "./tailwind.css";
import favicon from "./images/favicon.ico";
import { Web3Provider } from "./web3-provider";
import { ClientOnly } from "remix-utils/client-only";
import ErrorPage from "./components/error-page";
import { Toaster } from "react-hot-toast";
import { classNames } from "./utils/tailwind";
import Footer from "./components/footer";
import { Analytics } from "@vercel/analytics/react";
import { WindowEnv } from "./utils/env";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: favicon,
    type: "image/png",
  },
  { rel: "stylesheet", href: tailwindStylesHref },
];

export async function loader() {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  const ENV: WindowEnv = {
    WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID,
  };
  return json({
    ENV,
    commitSha,
  });
}

export default function App() {
  const { ENV, commitSha } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={classNames(
          navigation.state === "loading" && "animate-pulse",
        )}
      >
        <ClientOnly fallback={<Outlet />}>
          {() => (
            <Web3Provider>
              <Outlet />
            </Web3Provider>
          )}
        </ClientOnly>
        <Footer commit={commitSha} />
        <Toaster position="top-right" />
        <Analytics />

        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  return (
    <html lang="en">
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorPage />
        <Scripts />
      </body>
    </html>
  );
}
