import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dbConnect } from "./config/db.connect.js";
import authRoutes from "./routes/auth.route.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.route.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function startServer() {
  await dbConnect();
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/message", messageRoutes);
  app.use(globalErrorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
}

startServer();
