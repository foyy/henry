import { getPool } from "../database/connections";
import { insertSchedule } from "../database/persistence";
import { UTCString } from "../models/appointment";

export default async function createSchedule(
  providerID: string,
  startDate: UTCString,
  endDate: UTCString
): Promise<void> {
  /*
   See 1.4 in README for notes on createSchedule


   Here's roughly what the sql code would look like
    
  const updateScheduleSQL = `
  UPDATE schedules
  SET start_date = $2, end_date = $3
  WHERE provider_id = $1 AND date_trunc('day', start_date) = date_trunc('day', $2::timestamp)
`;

  const db = getPool();
  try {
    await db.query(updateScheduleSQL, [startDate, endDate, providerID]);
  } catch (error) {
    console.error("Error updating schedule:", error);
    throw new Error("Failed to update schedule");
  }
  */

  //Here's the in-memory solution

  insertSchedule(providerID, startDate, endDate);
}
