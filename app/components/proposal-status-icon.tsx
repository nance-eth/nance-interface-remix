import {
  TicketIcon,
  XCircleIcon,
  DocumentIcon,
  CheckCircleIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "~/utils/tailwind";

export default function ProposalStatusIcon({
  status,
  isActive = false,
}: {
  status: string;
  isActive?: boolean;
}) {
  if (["Voting", "Temperature Check"].includes(status)) {
    return (
      <TicketIcon
        className={classNames(
          isActive
            ? "text-indigo-600"
            : "text-green-500 group-hover:text-indigo-600",
          "h-6 w-6 shrink-0",
        )}
        aria-hidden="true"
      />
    );
  } else if (["Discussion"].includes(status)) {
    return (
      <ChatBubbleBottomCenterTextIcon
        className={classNames(
          isActive
            ? "text-indigo-600"
            : "text-orange-500 group-hover:text-indigo-600",
          "h-6 w-6 shrink-0",
        )}
        aria-hidden="true"
      />
    );
  } else if (["Archived", "Revoked", "Cancelled"].includes(status)) {
    return (
      <XCircleIcon
        className={classNames(
          isActive
            ? "text-indigo-600"
            : "text-gray-400 group-hover:text-indigo-600",
          "h-6 w-6 shrink-0",
        )}
        aria-hidden="true"
      />
    );
  } else if (["Approved", "Finished"].includes(status)) {
    return (
      <CheckCircleIcon
        className={classNames(
          isActive
            ? "text-indigo-600"
            : "text-gray-400 group-hover:text-indigo-600",
          "h-6 w-6 shrink-0",
        )}
        aria-hidden="true"
      />
    );
  } else {
    return (
      <DocumentIcon
        className={classNames(
          isActive
            ? "text-indigo-600"
            : "text-gray-400 group-hover:text-indigo-600",
          "h-6 w-6 shrink-0",
        )}
        aria-hidden="true"
      />
    );
  }
}
