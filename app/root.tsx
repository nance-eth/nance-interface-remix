import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
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

import tailwindStylesHref from "./tailwind.css";
import favicon from "./images/favicon.ico";
import { Web3Provider } from "./web3-provider";
import { ClientOnly } from "remix-utils/client-only";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: favicon,
    type: "image/png",
  },
  { rel: "stylesheet", href: tailwindStylesHref },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const wcProjectId = process.env.WALLETCONNECT_PROJECT_ID;
  return json({
    wcProjectId,
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
        <ClientOnly fallback={<Outlet />}>
          {() => (
            <Web3Provider wcProjectId={wcProjectId}>
              <Outlet />
            </Web3Provider>
          )}
        </ClientOnly>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
