import { Appointment, UTCString } from "../models/appointment";

//See 1.7 in READ.ME for notes on this hacky in-memory solution
//Restating here that this is not at all what I would do in production, and is just a quick way to get a couple of the routes actually working. Discussion of what I would actually do, and the actual data model and other decisions, is in the READ.ME

const appointments: Appointment[] = [];

export function insertSchedule(
  providerID: string,
  startDate: UTCString,
  endDate: UTCString
): void {
  let start = new Date(startDate);
  let end = new Date(endDate);

  while (start < end) {
    appointments.push({
      appointmentID: `${providerID}-${start.toISOString()}`,
      providerID,
      startTime: start.toISOString(),
      endTime: new Date(start.getTime() + 15 * 60 * 1000).toISOString(),
      clientID: "",
      status: "available",
    });
    start.setMinutes(start.getMinutes() + 15);
  }
}

export function getAvailableAppointments(
  providerID: string,
  startTime: UTCString,
  endTime: UTCString
): Appointment[] {
  console.log({ providerID, startTime, endTime });
  console.log("APPOINTMENTS", appointments);
  return appointments.filter(
    (a) =>
      a.providerID === providerID &&
      new Date(a.startTime) >= new Date(startTime) &&
      new Date(a.endTime) <= new Date(endTime) &&
      a.status === "available"
  );
}
