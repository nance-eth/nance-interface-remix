import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import toast from "react-hot-toast";
import {
  Action,
  CustomTransaction,
  Payout,
  SpaceInfo,
  Transfer,
} from "@nance/nance-sdk";
import {
  stringAsNonNegativeBigInt,
  stringAsNonNegativeNumber,
} from "~/utils/zodSchema";
import { getUnixTime } from "date-fns";
import { useSafeTokenBalances } from "~/hooks/safe-token-balances";
import { useOutletContext } from "@remix-run/react";
import { formatBigUnits } from "~/utils/number";
import ProjectSearch from "~/components/project-search";
import FunctionSelector from "~/components/function-selector";
import { FunctionFragment, Interface } from "ethers";
import { useSafeInject } from "~/components/SafeInjectIframeCard/context/SafeInjectedContext";
import SafeInjectIframeCard from "~/components/SafeInjectIframeCard";

// Schema validation for inputs
const PayoutSchema = z.object({
  project: z.number().min(0).default(0),
  address: z.string().length(42),
  amount: stringAsNonNegativeNumber,
  duration: stringAsNonNegativeNumber,
});
type PayoutForm = z.infer<typeof PayoutSchema>;
const payoutResolver = zodResolver(PayoutSchema);

const TransferSchema = z.object({
  to: z.string().length(42),
  contract: z.string().length(42),
  amount: stringAsNonNegativeNumber,
});
type TransferForm = z.infer<typeof TransferSchema>;
const transferResolver = zodResolver(TransferSchema);

const CustomTransactionArgSchema = z.object({
  name: z.string(),
  type: z.string(),
  value: z.string(),
});
const CustomTransactionSchema = z.object({
  contract: z.string().length(42),
  value: z.union([z.bigint().nonnegative(), stringAsNonNegativeBigInt]),
  functionName: z.string(),
  args: CustomTransactionArgSchema.array(),
});
type CustomTransactionForm = z.infer<typeof CustomTransactionSchema>;
type CustomTransactionArg = z.infer<typeof CustomTransactionArgSchema>;
const customTransactionResolver = zodResolver(CustomTransactionSchema);

// Form component
export function PayoutActionForm({
  open,
  closeModal,
  addAction,
}: {
  open: boolean;
  closeModal: () => void;
  addAction: (action: Action) => void;
}) {
  // React-hook-form to handle form validation and value modeling
  const {
    register,
    trigger,
    getValues,
    reset,
    control,
    formState: { errors },
  } = useForm<PayoutForm>({
    // Validate input when onBlur (lost focus)
    mode: "onBlur",
    // Use zod to validate inputs
    resolver: payoutResolver,
  });

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <form>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Payout
                  </Dialog.Title>

                  <div className="isolate mt-4 -space-y-px rounded-md shadow-sm">
                    <div className="relative rounded-md rounded-b-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="address"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Beneficiary
                      </label>
                      <input
                        type="text"
                        {...register("address")}
                        className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="0xEdf62C8A931e164E20f221f4c95397Fba4b6568A"
                      />
                      <ErrorMessage
                        errors={errors}
                        name="address"
                        render={({ message }) => (
                          <p className="text-xs text-red-500">{message}</p>
                        )}
                      />
                    </div>
                    <div className="relative rounded-md rounded-b-none rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="project"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Project
                      </label>
                      <Controller
                        control={control}
                        name="project"
                        render={({
                          field: { onChange, onBlur, value, ref },
                        }) => <ProjectSearch val={value} setVal={onChange} />}
                      />

                      <ErrorMessage
                        errors={errors}
                        name="project"
                        render={({ message }) => (
                          <p className="text-xs text-red-500">{message}</p>
                        )}
                      />
                    </div>
                    <div className="relative rounded-md rounded-b-none rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="amount"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Amount
                      </label>
                      <input
                        type="number"
                        {...register("amount")}
                        className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="1500"
                      />
                      <ErrorMessage
                        errors={errors}
                        name="amount"
                        render={({ message }) => (
                          <p className="text-xs text-red-500">{message}</p>
                        )}
                      />
                    </div>
                    <div className="relative rounded-md rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="duration"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Duration (cycles)
                      </label>
                      <input
                        type="number"
                        {...register("duration")}
                        className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="7"
                      />
                      <ErrorMessage
                        errors={errors}
                        name="duration"
                        render={({ message }) => (
                          <p className="text-xs text-red-500">{message}</p>
                        )}
                      />
                    </div>
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
                        toast.promise(
                          // Trigger validation
                          trigger().then((valid) => {
                            if (!valid) throw new Error("not valid");

                            // Parse again because getValues will return values in string
                            const values = PayoutSchema.parse(getValues());
                            const payout: Payout = {
                              type: values.project > 0 ? "project" : "address",
                              project: values.project,
                              address: values.address,
                              amountUSD: values.amount,
                              count: values.duration,
                            };
                            addAction({
                              type: "Payout",
                              // Generate uuid to be key of react elements
                              uuid: `p-${values.project}-${values.address}-${getUnixTime(new Date())}`,
                              payload: payout,
                            });
                            // Clear inputs
                            reset();
                            closeModal();
                          }),
                          {
                            loading: "Validating...",
                            success: "Action added.",
                            error: "Inputs has error, pls check.",
                          },
                        );
                      }}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function TransferActionForm({
  open,
  closeModal,
  addAction,
}: {
  open: boolean;
  closeModal: () => void;
  addAction: (action: Action) => void;
}) {
  const {
    register,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<TransferForm>({
    mode: "onBlur",
    resolver: transferResolver,
  });
  const { spaceInfo } = useOutletContext<{ spaceInfo: SpaceInfo }>();
  const { data } = useSafeTokenBalances(
    spaceInfo.transactorAddress?.address || "",
    spaceInfo.transactorAddress?.type === "safe" &&
      spaceInfo.transactorAddress?.address !== undefined,
  );
  const tokenBalances = data?.filter((b) => b.token !== null);

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <form>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Transfer
                  </Dialog.Title>

                  <div className="isolate mt-4 -space-y-px rounded-md shadow-sm">
                    <div className="relative rounded-md rounded-b-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="to"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Address
                      </label>
                      <input
                        type="text"
                        {...register("to")}
                        className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="0xEdf62C8A931e164E20f221f4c95397Fba4b6568A"
                      />
                      <ErrorMessage
                        errors={errors}
                        name="to"
                        render={({ message }) => (
                          <p className="text-xs text-red-500">{message}</p>
                        )}
                      />
                    </div>
                    <div className="relative rounded-md rounded-b-none rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="contract"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Token
                      </label>
                      <select
                        {...register("contract")}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
                      >
                        {tokenBalances?.map((balance) => (
                          <option
                            key={balance.tokenAddress}
                            value={balance.tokenAddress || ""}
                          >{`${balance.token?.symbol} (balance: ${formatBigUnits(BigInt(balance.balance), balance.token?.decimals || 18, false)})`}</option>
                        ))}
                      </select>

                      <ErrorMessage
                        errors={errors}
                        name="contract"
                        render={({ message }) => (
                          <p className="text-xs text-red-500">{message}</p>
                        )}
                      />
                    </div>
                    <div className="relative rounded-md rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="amount"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Amount
                      </label>
                      <input
                        type="text"
                        {...register("amount")}
                        className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="1500"
                      />
                      <ErrorMessage
                        errors={errors}
                        name="amount"
                        render={({ message }) => (
                          <p className="text-xs text-red-500">{message}</p>
                        )}
                      />
                    </div>
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
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
                      onClick={() => {
                        toast.promise(
                          // Trigger validation
                          trigger().then((valid) => {
                            if (!valid) throw new Error("not valid");

                            // Parse again because getValues will return values in string
                            const values = TransferSchema.parse(getValues());
                            const transfer: Transfer = {
                              to: values.to,
                              contract: values.contract,
                              amount: values.amount.toString(),
                              // FIXME attach automatically?
                              //   or not necessary anymore since we are attaching actions
                              //   into proposal text
                              decimals: 6,
                            };
                            addAction({
                              type: "Transfer",
                              // Generate uuid to be key of react elements
                              uuid: `p-${values.to}-${values.contract}-${getUnixTime(new Date())}`,
                              payload: transfer,
                            });
                            // Clear inputs
                            reset();
                            closeModal();
                          }),
                          {
                            loading: "Validating...",
                            success: "Action added.",
                            error: "Inputs has error, pls check.",
                          },
                        );
                      }}
                    >
                      Add
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function CustomTransactionActionForm({
  open,
  closeModal,
  addAction,
}: {
  open: boolean;
  closeModal: () => void;
  addAction: (action: Action) => void;
}) {
  // React-hook-form to handle form validation and value modeling
  const {
    register,
    trigger,
    setValue,
    getValues,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<CustomTransactionForm>({
    // Validate input when onBlur (lost focus)
    mode: "onBlur",
    // Use zod to validate inputs
    resolver: customTransactionResolver,
  });
  const { replace, fields } = useFieldArray({ control, name: "args" });

  const { latestTransaction, setLatestTransaction } = useSafeInject();

  const [functionFragment, setFunctionFragment] = useState<FunctionFragment>();
  const [functionData, setFunctionData] = useState<string>();

  useEffect(() => {
    if (latestTransaction) {
      setValue("contract", latestTransaction.to);
      setValue("value", BigInt(latestTransaction.value));
      setFunctionData(latestTransaction.data);
      toast.success("Transaction saved in form, check below inputs.");
    }
  }, [latestTransaction, setValue]);

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
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <form>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Custom Transaction
                  </Dialog.Title>

                  <div className="mt-4">
                    <SafeInjectIframeCard />
                  </div>

                  <div className="isolate mt-4 -space-y-px rounded-md shadow-sm">
                    <div className="relative rounded-md rounded-b-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="contract"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Contract
                      </label>
                      <input
                        type="text"
                        {...register("contract")}
                        className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="0xEdf62C8A931e164E20f221f4c95397Fba4b6568A"
                      />
                      <ErrorMessage
                        errors={errors}
                        name="contract"
                        render={({ message }) => (
                          <p className="text-xs text-red-500">{message}</p>
                        )}
                      />
                    </div>
                    <div className="relative rounded-md rounded-b-none rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="functionName"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Function Name
                      </label>
                      <Controller
                        name="functionName"
                        control={control}
                        rules={{
                          required: "Can't be empty",
                        }}
                        render={({
                          field: { onChange, onBlur, value, ref },
                        }) => (
                          <FunctionSelector
                            address={watch("contract", "")}
                            val={value}
                            setVal={onChange}
                            setFunctionFragment={(f) => {
                              setFunctionFragment(f);

                              if (functionData) {
                                // load args from latest transaction
                                const iface = new Interface([f]);
                                const decoded = iface.decodeFunctionData(
                                  f.name,
                                  functionData,
                                );
                                const args = decoded.map((v) => v);

                                args.forEach((arg, index) => {
                                  setValue(`args.${index}`, arg);
                                });
                                replace(
                                  args.map((v, index) => ({
                                    value: v.toString(),
                                    type: f.inputs[index].type,
                                    name: f.inputs[index].name,
                                  })),
                                );
                                // clear this one-time data that we got from latest transaction
                                setFunctionData(undefined);
                              } else {
                                // reset args
                                replace(
                                  f.inputs?.map((param) => {
                                    return {
                                      value: "",
                                      type: param.type,
                                      name: param.name,
                                    };
                                  }) || [],
                                );
                              }
                            }}
                            inputStyle="h-10"
                            functionData={functionData}
                          />
                        )}
                      />

                      <ErrorMessage
                        errors={errors}
                        name="project"
                        render={({ message }) => (
                          <p className="text-xs text-red-500">{message}</p>
                        )}
                      />
                    </div>
                    <div className="relative rounded-md rounded-b-none rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="value"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Value
                      </label>
                      <input
                        type="number"
                        {...register("value")}
                        className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="1500"
                      />
                      <ErrorMessage
                        errors={errors}
                        name="value"
                        render={({ message }) => (
                          <p className="text-xs text-red-500">{message}</p>
                        )}
                      />
                    </div>
                  </div>

                  <div className="isolate mt-4 -space-y-px rounded-md shadow-sm">
                    {(fields as unknown as CustomTransactionArg[]).map(
                      (field, index) => (
                        <div
                          key={index}
                          className="relative rounded-md rounded-b-none rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600"
                        >
                          <label
                            htmlFor="value"
                            className="block text-xs font-medium text-gray-900"
                          >
                            {field.name}
                          </label>

                          <input
                            type="text"
                            {...register(`args.${index}.value`)}
                            className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                          <ErrorMessage
                            errors={errors}
                            name={`args.${index}.value`}
                            render={({ message }) => (
                              <p className="text-xs text-red-500">{message}</p>
                            )}
                          />
                        </div>
                      ),
                    )}
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
                        toast.promise(
                          // Trigger validation
                          trigger().then((valid) => {
                            if (!valid) throw new Error("not valid");

                            // Parse again because getValues will return values in string
                            const values =
                              CustomTransactionSchema.parse(getValues());
                            const customTransaction: CustomTransaction = {
                              contract: values.contract,
                              functionName: values.functionName,
                              value: values.value.toString(),
                              args: values.args,
                            };
                            addAction({
                              type: "Custom Transaction",
                              // Generate uuid to be key of react elements
                              uuid: `p-${values.contract}-${values.functionName}-${getUnixTime(new Date())}`,
                              payload: customTransaction,
                            });
                            // Clear inputs
                            reset();
                            replace([]);
                            setLatestTransaction(undefined);
                            closeModal();
                          }),
                          {
                            loading: "Validating...",
                            success: "Action added.",
                            error: "Inputs has error, pls check.",
                          },
                        );
                      }}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
