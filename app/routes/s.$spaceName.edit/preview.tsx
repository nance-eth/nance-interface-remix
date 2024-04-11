import { Dialog, Transition } from "@headlessui/react";
import { Action } from "@nance/nance-sdk";
import { Fragment } from "react";
import MarkdownWithTOC from "../s.$spaceName.$proposalIdOrUuid/markdown-with-toc";
import { useSubmit } from "@remix-run/react";
import { actionToMarkdown } from "~/utils/actionParser";

export default function PreviewForm({
  open,
  closeModal,
  title,
  body,
  actions,
}: {
  open: boolean;
  closeModal: () => void;
  title: string;
  body: string;
  actions: Action[];
}) {
  const submit = useSubmit();

  const modifiedBody = `${body}\n\n## Actions\n${actions.map((a) => "* " + actionToMarkdown(a)).join("\n")}`;
  console.debug("a", { modifiedBody });

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Preview - {title}
                </Dialog.Title>

                <div className="isolate mt-4 -space-y-px rounded-md shadow-sm">
                  <MarkdownWithTOC
                    body={modifiedBody || "--- No content ---"}
                  />
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      submit(
                        { title, body: modifiedBody },
                        { method: "post", encType: "application/json" },
                      );
                    }}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
                  >
                    Confirm
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
