const jwt = require("jsonwebtoken");
const Token = require("../model/token");

const ACCESS_TOKEN =
  "5141CA801CB63011B3A99AB38358F272B1B0BC863590BDA0DCEBF316F13C040E";
const REFRESH_TOKEN =
  "82F99562D17769DAAD08B5B0D757DAD1C006CCFB25B4246643509C9D4803F60E";

class JWTServices {
  //sign Access token
  static signAccessToken(payload, expiryTime) {
    return jwt.sign(payload, ACCESS_TOKEN, { expiresIn: expiryTime });
  }

  //sign Refresh token
  static signRefreshToken(payload, expiryTime) {
    return jwt.sign(payload, REFRESH_TOKEN, { expiresIn: expiryTime });
  }

  //verify Access token
  static verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN);
  }

  //verify Refresh token
  static verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN);
  }

  //store data in database
  static async storeRefreshToken(token, userId) {
    try {
      const data = await Token.create({
        token,
        userId,
      });
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }
}

module.exports = JWTServices;
