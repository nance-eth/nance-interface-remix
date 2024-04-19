import { SpaceInfo } from "@nance/nance-sdk";
import { useOutletContext } from "@remix-run/react";
import { format } from "date-fns";
import { useSpaceConfig } from "~/data/nance";
import { calculateRecent3Schedules } from "~/utils/governanceCycle";
import { classNames } from "~/utils/tailwind";

export default function GovernanceSchedule() {
  const { spaceInfo } = useOutletContext<{
    spaceInfo: SpaceInfo;
  }>();
  const { data } = useSpaceConfig(spaceInfo.name);
  const schedules = calculateRecent3Schedules(
    data?.cycleStageLengths || [],
    spaceInfo.currentEvent,
  );

  return (
    <div className="mx-auto mt-8 flow-root max-w-lg">
      <h2 className="text-base font-semibold leading-6 text-gray-900">
        Governance schedule
      </h2>
      <ol className="mt-2 divide-y divide-gray-200 text-sm leading-6 text-gray-500">
        {schedules.map((schedule, index) => (
          <li
            className={classNames(
              "py-4 sm:flex",
              index === 1 && "text-indigo-600",
            )}
            key={schedule.date.toISOString()}
          >
            <time
              dateTime={schedule.date.toISOString()}
              className="w-28 flex-none"
            >
              {format(schedule.date, "EEE, LLL d")}
            </time>
            <p className="mt-2 flex-auto sm:mt-0">{schedule.eventTitle}</p>
            <p className="flex-none sm:ml-6">
              <time dateTime={schedule.date.toISOString()}>
                {format(schedule.date, "h:mm aa")}
              </time>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
