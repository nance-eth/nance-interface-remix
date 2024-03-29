import { Action } from "@nance/nance-sdk";
import ActionLabel from "~/components/action-label";

export default function ActionList({
  actions,
  removeAction,
}: {
  actions: Action[] | undefined;
  removeAction: (i: number) => void;
}) {
  if (actions === undefined || actions.length === 0) return null;

  return (
    <div className="my-2 rounded-md border px-4 py-2 shadow-sm">
      <ul className="divide-y divide-gray-100">
        {actions.map((action, index) => (
          <li
            key={action.uuid}
            className="flex items-center justify-between gap-x-6 py-2"
          >
            <div className="flex min-w-0 gap-x-4">
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {action.type}
                </p>
                <div className="break-words text-xs">
                  <ActionLabel action={action} />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                removeAction(index);
              }}
              className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {/* <a
        href="#"
        className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
      >
        View all
      </a> */}
    </div>
  );
}
