import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import sequelize from "./config/database";
import appRoutes from "./router/appRoutes";
import "./models";

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", appRoutes);
app.use("/image", express.static(path.join(process.cwd(), "uploads")));
app.use("/image", express.static(path.join(process.cwd(), "assets")));

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

startServer();
