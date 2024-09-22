import express from "express";
import userRouter from "./routes/user.js";
import taskRouter from "./routes/task.js";

import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";
import cors from "cors";

export const app = express();

//to declare env variable
config({
  path: "./data/config.env",
});

//only if this is present we can use res.json()
//This is placed befrore userRoutes so that we can use res.json() in userRouter
app.use(express.json());
app.use(cookieParser()); //to read cookie so that you can get to know the u_id of user logged in
app.use(
  cors({
    origin: [process.env.FRONT_END_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, //only then the headers in the backend(cookies) will be passed to the frontend
  })
);

//Using routes
//This is the route added before every route in the routes folder
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);

app.get("/", (req, res) => {
  res.send("Nice Working");
});

//this is an error middleware as it gets error as an argument
app.use(errorMiddleware);
