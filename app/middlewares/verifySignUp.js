const User = require("../models/user.model");

checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    });

    if (existingUser) {
      return res.status(400).send({
        message: "Failed! Username or Email is already in use!",
      });
    }

    next();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
};

module.exports = verifySignUp;

