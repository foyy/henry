export type ReserveStatus = "cancel" | "confirm";

export type UTCString = string;

export interface Appointment {
  appointmentID: string;
  startTime: UTCString;
  endTime: UTCString;
  providerID: string;
  clientID: string;
  status: "available" | "reserved" | "confirmed";
}
