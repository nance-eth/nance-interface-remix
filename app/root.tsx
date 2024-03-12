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
} from "@remix-run/react";
import { cssBundleHref } from "@remix-run/css-bundle";

import tailwindStylesHref from "./tailwind.css";
import favicon from "./images/favicon.ico";
import { Web3Provider } from "./web3-provider";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: favicon,
    type: "image/png",
  },
  ...(cssBundleHref
    ? [{ rel: "stylesheet", href: cssBundleHref }]
    : []),
  { rel: "stylesheet", href: tailwindStylesHref },
];

export async function loader() {
  return json({
    wcProjectId: process.env.WALLETCONNECT_PROJECT_ID,
  });
}

export default function App() {
  const { wcProjectId } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Web3Provider wcProjectId={wcProjectId}>
          <Outlet />
        </Web3Provider>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
