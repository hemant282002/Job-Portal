// controllers/userController.js

import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";

// REGISTER USER
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  // Check if all required fields are filled
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form !"));
  }

  // Validate phone number format (basic 10-digit)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return next(new ErrorHandler("Please enter a valid 10-digit phone number."));
  }

  // Check for existing email
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered !"));
  }

  // Check for existing phone number
  const isPhone = await User.findOne({ phone });
  if (isPhone) {
    return next(new ErrorHandler("Phone number already registered !"));
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });

  sendToken(user, 201, res, "User Registered Successfully !");
});

// LOGIN USER
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password, and role!"));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and ${role} not found!`, 404)
    );
  }

  sendToken(user, 201, res, "User Logged In Successfully!");
});

// LOGOUT USER
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully!",
    });
});

// GET LOGGED-IN USER
export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});
