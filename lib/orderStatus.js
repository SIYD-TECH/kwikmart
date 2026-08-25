// lib/utils/orderStatus.js (no "use server" at top)
export const STATUS_SEQUENCE = [
  "paid",
  "preparing",
  "ready_for_pickup",
  "picked_up",
];

export function getNextStatus(currentStatus) {
  const index = STATUS_SEQUENCE.indexOf(currentStatus);
  if (index === -1 || index === STATUS_SEQUENCE.length - 1) return null;
  return STATUS_SEQUENCE[index + 1];
}
