import { DateEvent, GovernanceEventName } from "@nance/nance-sdk";
import { addDays, subDays } from "date-fns";

/**
 * Calculate schedules of recent three event based on current event
 * @returns [PreviousEvent, event, NextEvent]
 */
export function calculateRecent3Schedules(
  cycleStageLengths: number[],
  currentEvent: DateEvent,
) {
  const startDate = new Date(currentEvent.start);
  const eventName = currentEvent.title;
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

/**
 * Get start and end date with delta cycle based on currentEvent
 */
export function scheduleOfCycle(
  cycleStageLengths: number[],
  cycleDelta: number,
  currentEvent: DateEvent,
) {
  const startDate = new Date(currentEvent.start);
  const eventName = currentEvent.title;
  const currentIndex = GovernanceEventName.indexOf(eventName);

  const startDateOfCycle = subDays(
    startDate,
    cycleStageLengths.slice(0, currentIndex).reduce((sum, val) => sum + val, 0),
  );
  const cycleLength = cycleStageLengths.reduce((sum, val) => sum + val, 0);

  return {
    start: addDays(startDateOfCycle, cycleLength * cycleDelta),
    end: addDays(startDateOfCycle, cycleLength * cycleDelta + cycleLength),
  };
}
