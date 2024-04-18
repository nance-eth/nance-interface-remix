import {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import { cssBundleHref } from "@remix-run/css-bundle";
import NanceEditor from "~/components/MarkdownEditor.client";
import { Form, useLoaderData } from "@remix-run/react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// css for the Nance editor
import "@nance/nance-editor/lib/editor.css";
import invariant from "tiny-invariant";
import {
  Action,
  Proposal,
  ProposalStatusNames,
  getProposal,
} from "@nance/nance-sdk";
import { Controller, useForm } from "react-hook-form";
import ActionPalettes from "./action-palettes";
import ActionList from "./action-list";
import { useState } from "react";
import PreviewForm from "./preview";
import { newProposal, updateProposal } from "~/data/nance";
import { isAddress } from "viem";
import { uuid } from "~/utils/uuid";

const schema = z.object({
  uuid: z.string(),
  title: z.string().min(1),
  body: z.string().min(1),
  status: z.enum(ProposalStatusNames),
  uploaderAddress: z.string().refine(isAddress),
  uploaderSignature: z.string(),
});

type FormData = z.infer<typeof schema>;

const resolver = zodResolver(schema);

function EditPageInternal() {
  const { IPFS_GATEWAY, IPFS_ID, IPFS_SECRET, loadedProposal } = useLoaderData<{
    IPFS_GATEWAY: string;
    IPFS_ID: string;
    IPFS_SECRET: string;
    loadedProposal?: Proposal;
  }>();
  const [actions, setActions] = useState<Action[]>(
    loadedProposal?.actions || [],
  );
  const [previewEnabled, setPreviewEnabled] = useState(false);

  const { getValues, register, control } = useForm<FormData>({
    mode: "onBlur",
    resolver,
    defaultValues: {
      uuid: loadedProposal?.uuid || uuid(),
      title: loadedProposal?.title || "Proposal Title",
      body: loadedProposal?.body || TEMPLATE,
      status: loadedProposal?.status || "Discussion",
    },
  });

  return (
    <Form className="p-6 lg:p-12">
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-lg font-semibold leading-7 text-gray-900">
            {loadedProposal
              ? `Edit Proposal - ${loadedProposal.proposalId || "tbd"}: ${loadedProposal.title}`
              : "New Proposal"}
          </h2>
          {/* <p className="mt-1 text-sm leading-6 text-gray-600">
            This information will be displayed publicly so be careful what you
            share.
          </p> */}

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Title
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="text"
                    {...register("title")}
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="body"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Body
              </label>
              <div className="mt-2">
                <Controller
                  name="body"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <NanceEditor
                      initialValue={loadedProposal?.body || TEMPLATE}
                      fileUploadIPFS={
                        IPFS_GATEWAY && IPFS_ID && IPFS_SECRET
                          ? {
                              gateway: IPFS_GATEWAY,
                              auth: `Basic ${Buffer.from(`${IPFS_ID}:${IPFS_SECRET}`).toString("base64")}`,
                            }
                          : undefined
                      }
                      onEditorChange={(value) => {
                        onChange(value);
                      }}
                    />
                  )}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Drag and drop markdown file or image to attach content (images
                are pinned to IPFS).
              </p>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="actions"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Actions
              </label>
              <ActionList
                actions={actions}
                removeAction={(i) => {
                  const actionsCopy = actions.slice();
                  actionsCopy.splice(i, 1);
                  setActions(actionsCopy);
                }}
              />
              <ActionPalettes
                addAction={(action) => {
                  const actionsCopy = actions.slice();
                  actionsCopy.push(action);
                  setActions(actionsCopy);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => setPreviewEnabled(true)}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Review and sign
        </button>
      </div>

      <PreviewForm
        open={previewEnabled}
        closeModal={() => setPreviewEnabled(false)}
        uuid={getValues("uuid")}
        title={getValues("title")}
        body={getValues("body")}
        actions={actions}
      />
    </Form>
  );
}

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.spaceName, "Missing spaceName param");

  const url = new URL(request.url);
  const proposalIdOrUuid = url.searchParams.get("proposal");
  const data: FormData = await request.json();
  const apiCall = proposalIdOrUuid ? updateProposal : newProposal;
  const ret = await apiCall({
    space: params.spaceName,
    proposal: {
      uuid: data.uuid,
      title: data.title,
      body: data.body,
      status: data.status,
      actions: [],
    },
    uploaderAddress: data.uploaderAddress,
    uploaderSignature: data.uploaderSignature,
  });

  if (ret.success) {
    return redirect(`/s/${params.spaceName}/${ret.data.uuid}`);
  } else {
    throw json("Error: " + ret.error, { status: 500 });
  }
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.spaceName, "Missing spaceName param");

  const url = new URL(request.url);
  const proposalIdOrUuid = url.searchParams.get("proposal");
  if (proposalIdOrUuid === null) {
    return json({
      IPFS_GATEWAY: process.env.IPFS_GATEWAY,
      IPFS_ID: process.env.INFURA_IPFS_ID,
      IPFS_SECRET: process.env.INFURA_IPFS_SECRET,
      loadedProposal: undefined,
    });
  }

  const proposal = await getProposal({
    space: params.spaceName,
    uuid: proposalIdOrUuid,
  });
  return json({
    IPFS_GATEWAY: process.env.IPFS_GATEWAY,
    IPFS_ID: process.env.INFURA_IPFS_ID,
    IPFS_SECRET: process.env.INFURA_IPFS_SECRET,
    loadedProposal: proposal,
  });
}

export default function EditPage() {
  return (
    <ClientOnly fallback={"Loading..."}>
      {() => <EditPageInternal />}
    </ClientOnly>
  );
}

const TEMPLATE =
  "## Synopsis\n*State what the proposal does in one sentence.*\n\n## Motivation\n*What problem does this solve? Why now?*\n\n## Specification\n*How exactly will this be executed? Be specific and leave no ambiguity.*\n\n## Rationale\n*Why is this specification appropriate?*\n\n## Risks\n*What might go wrong?*\n\n## Timeline\n*When exactly should this proposal take effect? When exactly should this proposal end?*";
