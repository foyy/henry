export function reserveAppointment({
  clientID,
  providerID,
  startTime,
  endTime,
}: {
  clientID: string;
  providerID: string;
  startTime: string;
  endTime: string;
}): Promise<void | Error> {
  /*
     We could throw an error here if the starTime is < 24 hours since that's against the rules. Ideally of course our client wouldn't allow the user to pass us that kind of invalid data but we should handle it here as well.
    */

  console.log(
    `With more time, I'd be implementing a REDIS cache to hold reservations this with ${clientID} ${providerID} ${startTime} ${endTime}`
  );

  // See 1.5 in READ.ME on how I would use REDIS to do this

  return Promise.resolve("So fast" as any);
}

export function confirmReservation({
  clientID,
  providerID,
  startTime,
  endTime,
}: {
  clientID: string;
  providerID: string;
  startTime: string;
  endTime: string;
}): Promise<void | Error> {
  console.log(
    `With more time, I'd be implementing a REDIS cache to handle confirming reservations this with ${clientID} ${providerID} ${startTime} ${endTime}`
  );

  /*
    See 1.6 in READ.ME on confirming reservations
    */

  return Promise.resolve("So fast" as any);
}

export function cancelReservation({
  clientID,
  providerID,
  startTime,
  endTime,
}: {
  clientID: string;
  providerID: string;
  startTime: string;
  endTime: string;
}): Promise<void | Error> {
  console.log(
    `With more time, I'd be implementing a REDIS cache to hold reservations this with ${clientID} ${providerID} ${startTime} ${endTime}`
  );

  /*
     1. remove the lock/hold from REDIS by deleting the key we instantiated at the time of creating the reservation
     2. We do not actually have to interact with our Appointments table here
    */

  return Promise.resolve("So fast" as any);
}
