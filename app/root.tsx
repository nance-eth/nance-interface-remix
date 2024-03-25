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

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: favicon,
    type: "image/png",
  },
  { rel: "stylesheet", href: tailwindStylesHref },
];

export async function loader() {
  const wcProjectId = process.env.WALLETCONNECT_PROJECT_ID;
  return json({
    wcProjectId,
  });
}

export default function App() {
  const { wcProjectId } = useLoaderData<typeof loader>();
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
            <Web3Provider wcProjectId={wcProjectId}>
              <Outlet />
            </Web3Provider>
          )}
        </ClientOnly>
        <Toaster position="top-right" />

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
