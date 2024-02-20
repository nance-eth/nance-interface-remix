import { LoaderFunctionArgs, json } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { getAllSpaces } from "~/nance";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const spaces = await getAllSpaces();
  return json({ spaces });
};

export default function Index() {
  const { spaces } = useLoaderData<typeof loader>();

  return (
    <p id="index-page">
      This is a Remix rebuild of nance interface.
      <br />
      Check out <a href="/contacts">contacts list</a> which is working demo.
      <br />
      <nav>
        {spaces.length ? (
          <ul>
            {spaces.map((space) => (
              <li key={space.name}>
                <NavLink
                  className={({ isActive, isPending }) =>
                    isActive ? "active" : isPending ? "pending" : ""
                  }
                  to={`spaces/${space.name}`}
                >
                  {space.name ? <>{space.name}</> : <i>No Name</i>}{" "}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            <i>No spaces</i>
          </p>
        )}
      </nav>
    </p>
  );
}
