import express from "express";
import appointmentRoutes from "./routes/appointmentRoutes";
import reservationRoutes from "./routes/reservationRoutes";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/appointments", appointmentRoutes);
app.use("/reservations", reservationRoutes);

const start = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
