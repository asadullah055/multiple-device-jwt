const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const loginHistory = require("../model/loginHistory");

class middleware {
  auth = async (req, res, next) => {
    const { cookie_token } = req;
    const { authorization } = req.headers;
    if (authorization) {
      const token = authorization.split("Bearer ")[1];
      if (token) {
        try {
          const user = await jwt.verify(token, "aaaaa4");
          const device = await loginHistory.findOne({
            $and: [
              {
                user_id: { $eq: new mongoose.mongo.ObjectId(user._id) },
              },
              {
                user_agent: { $eq: req.headers["user-agent"] },
              },
              {
                token: { $eq: cookie_token },
              },
            ],
          });
          if (device) {
            req.userInfo = {
              _id: user._id,
              name: user.name,
            };
            next();
          } else {
            return res.status(401).json({ message: "Unauthorize4" });
          }
        } catch (error) {
          console.log(error);
          return res.status(401).json({ message: "Unauthorize5" });
        }
      } else {
        return res.status(401).json({ message: "Unauthorize" });
      }
    } else {
      return res.status(401).json({ message: "Unauthorize" });
    }
  };
  cookie_check = async (req, res, next) => {
    const { user_token } = req.cookies;

    if (user_token) {
      req.cookie_token = user_token;
      next();
    } else {
      req.cookie_token = "";
      next();
    }
  };
}

module.exports = new middleware();
