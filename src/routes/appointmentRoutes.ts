import express, { Request, Response } from "express";
import createSchedule from "../services/createSchedule";
import getAppointments from "../services/getAppointments";
import { UTCString } from "../models/appointment";

const router = express.Router();

interface CreateScheduleRequest {
  providerID: string;
  startDate: UTCString;
  endDate: UTCString;
}

interface AppointmentRouteParams {
  providerID: string;
}

interface AppointmentQueryParams {
  startDate: string;
  endDate: string;
}

router.post(
  "/schedule",
  async (req: Request<{}, {}, CreateScheduleRequest>, res: Response) => {
    //Note: we'd likely send providerID in a JWT as opposed to body for security reasons
    const { startDate, endDate, providerID } = req.body;

    try {
      await createSchedule(providerID, startDate, endDate);
      res.json({ status: 200 });
    } catch (error) {
      // See 1.3 in README for not on error handling
      console.error(
        `Error creating schedule for providerID ${providerID}:`,
        error
      );
      res.status(500).json({ error: "Failed to create schedule" });
    }
  }
);

router.get(
  "/:providerID",
  async (
    req: Request<AppointmentRouteParams, {}, {}, AppointmentQueryParams>,
    res: Response
  ) => {
    const { providerID } = req.params;
    const { startDate, endDate } = req.query;

    try {
      const appointments = await getAppointments(
        providerID,
        startDate,
        endDate
      );
      res.json(appointments);
    } catch (error) {
      // See 1.3 in README for not on error handling
      console.error(
        `Error fetching appointments for providerID ${providerID}:`,
        error
      );
      res.status(500).json({
        error: `Error fetching appointments for providerID ${providerID}:`,
      });
    }
  }
);

export default router;
