import { addDays, subDays } from "date-fns";
import { DateEvent, GovernanceEventName } from "~/data/nance";

/**
 * Calculate schedules of recent three event based on current event
 * @returns [PreviousEvent, event, NextEvent]
 */
export function calculateRecent3Schedules(
  cycleStageLengths: number[],
  dateEvent: DateEvent,
) {
  const startDate = new Date(dateEvent.start);
  const eventName = dateEvent.title;
  const currentIndex = GovernanceEventName.indexOf(eventName);

  const previousIndex = (currentIndex - 1 + 4) % 4;
  const previousEventDate = subDays(
    startDate,
    cycleStageLengths[previousIndex],
  );

  const nextIndex = (currentIndex + 1) % 4;
  const nextEventDate = addDays(startDate, cycleStageLengths[nextIndex]);
  return [
    { date: previousEventDate, eventTitle: GovernanceEventName[previousIndex] },
    { date: startDate, eventTitle: eventName },
    { date: nextEventDate, eventTitle: GovernanceEventName[nextIndex] },
  ];
}
