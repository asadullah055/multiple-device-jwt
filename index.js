const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const body_parser = require("body-parser");
const cookies_parser = require("cookie-parser");
const dotenv = require("dotenv");
const requestIp = require("request-ip");
const userModel = require("./model/userModel");
const DeviceDetector = require("node-device-detector");
const loginHistory = require("./model/loginHistory");
const middleware = require("./middleware/middleware");
dotenv.config();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookies_parser());
app.use(body_parser.json());
app.use(requestIp.mw());

const get_device_info = (userAgent) => {
  const detector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
    deviceTrusted: false,
    deviceInfo: false,
    maxUserAgentSize: 500,
  });
  const obj = {};
  const result = detector.detect(userAgent);
  obj.name = result.os.name;
  obj.model = result.device.model ? result.device.model : "";
  obj.browser = result.client.name;
  obj.type = result.device.type;
  return obj;
};

app.post("/api/login", middleware.cookie_check, async (req, res) => {
  const { email, password } = req.body;
  const ip = req.clientIp;
  const device_info = get_device_info(req.headers["user-agent"]);

  try {
    const user = await userModel.findOne({ email });

    if (user) {
      if (password === user.password) {
        const token = await jwt.sign(
          {
            name: user.name,
            _id: user.id,
          },
          "aaaaa4",
          {
            expiresIn: "2d",
          }
        );

        if (req.cookie_token) {
          const device = await loginHistory.findOne({
            $and: [
              {
                user_id: { $eq: new mongoose.mongo.ObjectId(user.id) },
              },
              {
                user_agent: { $eq: req.headers["user-agent"] },
              },
              {
                token: { $eq: req.cookie_token },
              },
            ],
          });

          if (device) {
            await loginHistory.findByIdAndUpdate(device.id, {
              ip,
              time: Date.now(),
            });
          } else {
            const uniqueToken = Date.now();
            await loginHistory.create({
              user_id: user.id,
              ip,
              user_agent: req.headers["user-agent"],
              token: uniqueToken,
              device_info: device_info,
              time: uniqueToken,
            });
            res.cookie("user_token", uniqueToken, {
              expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            });
          }
        } else {
          const uniqueToken = Date.now();
          await loginHistory.create({
            user_id: user.id,
            ip,
            user_agent: req.headers["user-agent"],
            token: uniqueToken,
            device_info: device_info,
            time: uniqueToken,
          });
          res.cookie("user_token", uniqueToken, {
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          });
        }
        return res.status(201).json({ token, message: "Login success" });
      } else {
        return res.status(404).json({ message: "Password invalid" });
      }
    } else {
      return res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    return res.status(201).json({ message: error.message });
  }
});

app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;
  const ip = req.clientIp;
  const device_info = get_device_info(req.headers["user-agent"]);
  try {
    const getUser = await userModel.findOne({ email });
    if (getUser) {
      return res.status(404).json({ message: "Email Already Exit" });
    } else {
      const user = await userModel.create({
        email,
        name,
        password,
      });
      const uniqueToken = Date.now();
      await loginHistory.create({
        user_id: user.id,
        ip,
        user_agent: req.headers["user-agent"],
        token: uniqueToken,
        device_info: device_info,
        time: uniqueToken,
      });
      const token = await jwt.sign(
        {
          name: user.name,
          _id: user.id,
        },
        "aaaaa4",
        {
          expiresIn: "2d",
        }
      );
      res.cookie("user_token", uniqueToken, {
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      });
      return res.status(201).json({ token, message: "register success" });
    }
  } catch (error) {
    console.log(error);
    return res.status(201).json({ message: error.message });
  }
});
app.get(
  "/api/user/logout/:id",
  middleware.cookie_check,
  middleware.auth,
  async (req, res) => {
    const { id } = req.params;
    try {
      await loginHistory.findByIdAndDelete(id);
      return res.status(200).json({ message: "logout success" });
    } catch (error) {
      console.log(error);
      return res.status(201).json({ message: error.message });
    }
  }
);
app.get(
  "/api/all-user/logout",
  middleware.cookie_check,
  middleware.auth,
  async (req, res) => {
    const { _id } = req.userInfo;
    try {
      await loginHistory.deleteMany({
        $and: [
          {
            user_id: { $eq: new mongoose.mongo.ObjectId(_id) },
          },
          {
            token: { $ne: req.cookie_token },
          },
        ],
      });
      return res.status(200).json({ message: "logout success" });
    } catch (error) {
      console.log(error);
      return res.status(201).json({ message: error.message });
    }
  }
);
app.get(
  "/api/login/history",
  middleware.cookie_check,
  middleware.auth,
  async (req, res) => {
    const { _id } = req.userInfo;
    try {
      const login_history = await loginHistory
        .find({ user_id: new mongoose.mongo.ObjectId(_id) })
        .sort({ create: -1 });

      return res.status(200).json({ login_history });
    } catch (error) {
      console.log(error);
      return res.status(201).json({ message: error.message });
    }
  }
);

const db = async () => {
  try {
    await mongoose.connect(process.env.URL);
    console.log("database connect successfully");
  } catch (error) {}
};

db();

app.get("/", (req, res) => res.send("Hello World"));
app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
