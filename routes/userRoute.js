const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const router = express.Router();
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const sendEmail = require("../utils/sendEmail");
const { v4: uuidv4 } = require("uuid");
const clientURL = process.env.CLIENT_URL;

module.exports = router;

//Register route
router.post("/register", async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!(username && email && password)) {
      res.status(400).send("Please enter the required fields");
    }

    //User already exists
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      res.status(409).send("User already exists");
    }

    //Encrypt password
    const encryptedPassword = await bcrypt.hash(password, 10);

    //Generate user ID
    const randomNo = await uuidv4();
    const userId = `user-${randomNo}`;

    const data = new User({
      userId: userId,
      fullName: fullName,
      username: username,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    const user = await data.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("Please enter the required fields");
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json(user);
      return;
    }
    res.status(400).send("Invalid Credentials");
    return;
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Request password reset
router.post("/requestPassReset", async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(409).send("User does not exists");
      return;
    }

    let token = await Token.findOne({ userId: user.userId });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, 10);

    await new Token({
      userId: user.userId,
      createdAt: Date.now(),
      token: hash,
    }).save();

    const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user.userId}`;
    sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: `Click on this link to reset your password: ${link}`,
    });
    return res.json(link);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Reset password
router.post("/resetPassword", async (req, res) => {
  try {
    const { userId, password, token } = req.body;

    const passwordResetToken = await Token.findOne({ userId: userId });

    if (!passwordResetToken) {
      res.status(409).send("Invalid or expired password reset token");
      return;
    }

    const newPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
      { userId: userId },
      { $set: { password: newPassword } },
      { new: true }
    );

    const user = await User.findOne({ userId: userId });
    await sendEmail({
      email: user.email,
      subject: "Password Reset Successfully",
      message: "Your password reset was successful",
    });

    await passwordResetToken.deleteOne();

    return res.json({ message: "Password reset was successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
