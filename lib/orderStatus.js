// app/admin/(dashboard)/orders/statusHelpers.js
//
// This does NOT have 'use server' at the top — on purpose. It's just
// plain logic (look up what comes next in a list), nothing that needs
// database access or secret keys. Every function in a 'use server' file
// MUST be an async Server Action, with no exceptions — mixing in an
// ordinary helper function like this one breaks that rule, which is
// exactly the error we just hit.

const STATUS_SEQUENCE = ["paid", "preparing", "ready_for_pickup", "picked_up"];

export const STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  preparing: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  picked_up: "Picked Up",
  cancelled: "Cancelled",
};

export function getNextStatus(currentStatus) {
  const index = STATUS_SEQUENCE.indexOf(currentStatus);
  if (index === -1 || index === STATUS_SEQUENCE.length - 1) return null;
  return STATUS_SEQUENCE[index + 1];
}
