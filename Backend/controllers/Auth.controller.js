import User from "../models/user.model.js";
import bcrytpjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { redis } from "../library/redis.js";
const generateToken = (userId) => {
  const accessToken = jwt.sign(
    { userId: userId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export async function SignUp(req, res) {
  const { email, password, name } = req.body;
  try {
    const UserExists = await User.findOne({ email });
    if (UserExists) {
      return res.status(400).json({ message: "User already exists ⚠️" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email !" });
    }
    const newUser = await User({
      email,
      password,
      name,
    });

    const salt = await bcrytpjs.genSalt(10);
    const hash = await bcrytpjs.hash(newUser.password, salt);
    newUser.password = hash;
    const user = await newUser.save();

    const { accessToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in Signup:", error.message);
    res.status(500).json({ message: error.message });
  }
}

export async function Login(req, res) {
  try {
    const { email, password } = req.body;
    const verify = await User.findOne({ email });
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required ⚠️" });
    }

    if (!verify) {
      return res.status(400).json({ message: "Invalid password or email !" });
    }
    const lastverify = await bcrytpjs.compare(password, verify.password);
    if (!lastverify) {
      return res.status(400).json({ message: "Invalid password or email !" });
    }

    const { accessToken, refreshToken } = generateToken(verify._id);
    await storeRefreshToken(verify._id, refreshToken);
    setCookies(res, accessToken, refreshToken);
    res.json({
      _id: verify._id,
      name: verify.name,
      email: verify.email,
      role: verify.role,
    });
  } catch (error) {
    console.log("Server error in login:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function LogOut(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Server error in logout:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided 🚫" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token ⚠️" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.status(200).json({ message: "Token refreshed successfully 🎉 " });
  } catch (error) {
    console.log("Server error in RefreshToken:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getProfile(req, res) {
  try {
    res.json(req.user);
  } catch (error) {
    console.log("Server error in GetProfile:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
