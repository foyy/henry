import { getPool } from "../database/connections";
import { getAvailableAppointments } from "../database/persistence";
import { UTCString, Appointment } from "../models/appointment";

export default async function getAppointments(
  providerID: string,
  startDate: UTCString,
  endDate: UTCString
): Promise<Appointment[]> {
  //   const pool = getPool();

  //Here's what actual DB code might look like (this would live in an adapter file):

  /*
  const query = `
        SELECT *
        FROM appointments
        WHERE provider_id = $1
        AND start_time >= $2
        AND end_time <= $3
        ORDER BY start_time ASC
    `;

  try {
    await pool.query(query, [providerID, startDate, endDate]);
     result.rows.map((row) => ({
      appointmentID: row.appointment_id,
      startTime: row.start_time,
      endTime: row.end_time,
      providerID: row.provider_id,
      clientID: row.client_id,
    }));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
*/

  return getAvailableAppointments(providerID, startDate, endDate);
}
