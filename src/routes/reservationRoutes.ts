import express, { Request, Response } from "express";
import {
  reserveAppointment,
  confirmReservation,
  cancelReservation,
} from "../services/reserveAppointment";
import { Appointment } from "../models/appointment";

const router = express.Router();

interface ReserveAppointmentRequest {
  clientID: string;
  appointment: Appointment;
}

router.post(
  "/reserve",
  async (req: Request<{}, {}, ReserveAppointmentRequest>, res: Response) => {
    
    const { clientID, appointment } = req.body;
    const { providerID, startTime, endTime } = appointment;

    try {
      await reserveAppointment({ clientID, providerID, startTime, endTime });
      res.json({ status: 200, message: "Appointment reserved successfully" });
    } catch (error) {
      // See 1.3 in README for not on error handling
      console.error(`Error reserving appointment:`, error);
      res.status(500).json({ error: "Failed to reserve appointment" });
    }
  }
);

router.post(
  "/confirm",
  async (req: Request<{}, {}, ReserveAppointmentRequest>, res: Response) => {
    const { clientID, appointment } = req.body;
    const { providerID, startTime, endTime } = appointment;

    try {
      await confirmReservation({ clientID, providerID, startTime, endTime });
      res.json({
        status: 200,
        message: "Appointment confirmed successfully",
      });
    } catch (error) {
      console.error(`Error confirming appointment:`, error);
      res.status(500).json({ error: "Failed to confirm appointment" });
    }
  }
);

router.post(
  "/cancel",
  async (req: Request<{}, {}, ReserveAppointmentRequest>, res: Response) => {
    const { clientID, appointment } = req.body;
    const { providerID, startTime, endTime } = appointment;

    try {
      await cancelReservation({ clientID, providerID, startTime, endTime });
      res.json({
        status: 200,
        message: "Appointment cancelled successfully",
      });
    } catch (error) {
      console.error(`Error cancelling appointment:`, error);
      res.status(500).json({ error: "Failed to cancel appointment" });
    }
  }
);

export default router;
