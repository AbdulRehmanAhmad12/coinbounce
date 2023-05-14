const JWTServices = require("../services/JWTServices");
const User = require("../model/user");
const UserDto = require("../dto/user");

const auth = async (req, res, next) => {
  const { Refresh_token, Access_token } = req.cookies;

  if (!Refresh_token || !Access_token) {
    return next({ status: 401, message: "tokens not present" });
  }

  let id;
  try {
    id = JWTServices.verifyAccessToken(Access_token)._id;
  } catch (e) {
    return next(e);
  }

  try {

    const user = await User.findOne({ _id: id });
    const dto = new UserDto(user);

    req.user = dto;

    next();
  } catch (e) {
    return next(e);
  }
};

module.exports = auth;
