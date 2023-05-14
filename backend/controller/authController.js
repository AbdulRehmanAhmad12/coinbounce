const Joi = require("joi");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const UserDto = require("../dto/user");
const JWTServices = require("../services/JWTServices");
const RefreshToken = require("../model/token");

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const authController = {
  //Register a user
  async register(req, res, next) {
    const userRegistrationSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmpassword: Joi.ref("password"),
    });

    //validate user input
    const { error } = userRegistrationSchema.validate(req.body);

    //if err -> return error to user
    if (error) {
      return next(error);
    }

    //if email & username already exist -> return an error
    const { name, username, email, password } = req.body;

    try {
      const userName = await User.exists({ username: username });
      const mail = await User.exists({ email: email });

      if (mail) {
        const err = {
          status: 409,
          message: "Email already exists, try another one",
        };
        return next(err);
      }

      if (userName) {
        const err = {
          status: 409,
          message: "Username already exists, try another one",
        };
        return next(err);
      }
    } catch (err) {
      return next(err);
    }

    // //password hash
    let hashPassword = await bcrypt.hash(password, 10);

    // //store data in db & send response
    let accessToken;
    let refreshToken;
    let user;

    try {
      user = await User.create({
        username,
        name,
        email,
        password: hashPassword,
      });

      //Tokens
      accessToken = JWTServices.signAccessToken({ _id: user._id }, "30m");
      refreshToken = JWTServices.signRefreshToken({ _id: user._id }, "60m");

      console.log(user._id);
      //storing refresh token to db
      await JWTServices.storeRefreshToken(refreshToken, user._id);
    } catch (err) {
      return next(err);
    }

    //save access token in cookies
    res.cookie("Access_token", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    //save refresh token in cookies
    res.cookie("Refresh_token", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    //filtering & sending data
    const userDto = new UserDto(user);
    return res.status(200).json({ user: userDto, auth: true });
  },
  async login(req, res, next) {
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPattern).required(),
    });

    const { error } = userLoginSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { username, password } = req.body;
    let user;
    try {
      user = await User.findOne({ username });
      if (!user) {
        return next({ status: 401, message: "User not found" });
      }
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return next({ status: 401, message: "Password incorrect!" });
      }
    } catch (err) {
      return next(err);
    }

    let accessToken = JWTServices.signAccessToken({ _id: user._id }, "30m");
    let refreshToken = JWTServices.signRefreshToken({ _id: user._id }, "60m");

    //update refresh token in db
    try {
      const us = await RefreshToken.updateOne(
        { _id: user.id },
        { token: refreshToken },
        { upsert: true }
      );
    } catch (err) {
      return next(err);
    }
    //store data on client side
    //save access token in cookies
    res.cookie("Access_token", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    //save refresh token in cookies
    res.cookie("Refresh_token", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    const userDto = new UserDto(user);
    return res.status(200).json({ user: userDto, auth: true });
  },
  async logout(req, res) {
    //1. delete refresh token from database
    const { Refresh_Token } = req.cookies;
    try {
      await RefreshToken.deleteOne({ token: Refresh_Token });
    } catch (err) {
      console.log(err);
    }

    //delete cookies
    res.clearCookie("Refresh_token");
    res.clearCookie("Access_token");

    //2. send response to front-end
    res.status(200).json({ msg: "user logged out successfully!", auth: false });
  },
  async refresh(req, res, next) {
    //1. get refresh token from cookies
    const originalRefreshToken = req.cookies.Refresh_token;

    //2. verify refresh token
    let id;
    try {
      id = JWTServices.verifyRefreshToken(originalRefreshToken)._id;
    } catch (error) {
      return next({ status: 401, message: "unauthorized" });
    }

    //3. generate new tokens
    try {
      let accessToken = JWTServices.signAccessToken({ id }, "30m");
      let refreshToken = JWTServices.signRefreshToken({ id }, "60m");

      //4. update db, return response
      try {
        const match = await RefreshToken.findOne({
          _id: id,
          token: originalRefreshToken,
        });
        if (!match) {
          return next({ status: 401, message: "unauthorized" });
        }
      } catch (error) {
        return next(error);
      }

      //5. store new tokens in cookies
      res.cookie("Access_token", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      res.cookie("Refresh_token", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
    } catch (error) {
      return next(error);
    }

    const user = await User.findOne({ _id: id });
    const dto = new UserDto(user);

    res.status(200).json({ user: dto, auth: true });
  },
};

module.exports = authController;
