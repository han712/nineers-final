import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import serviceRoute from "./routes/serviceRoute.js";
// import orderRoute from "./routes/orderRoute.js";
// import reviewRoute from "./routes/reviewRoute.js";
import authRoute from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
dotenv.config();

const PORT = 8080;

const app = express();


mongoose.set("strictQuery", true);

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to mongoDB!");
  } catch (error) {
    console.log(error);
  }
};

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/services", serviceRoute);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).send(errorMessage);
});

app.get('/', (req, res) => {
  res.send("Hello from api! this is hanif gantengg sekal")
})

app.listen(PORT, () => {
  connect();
  console.log(`Listening at http://localhost:${PORT}`);
});