import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import ErrorHandler from "../middlewares/error.js";

//1)LOGIN---------------------------------------------------------------------------------
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //We cannot access password without .select() becaz password field in user schema is set to select:false
    //while searching for user with this email id ,only details not selected as false will be displayed
    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Invalid Email or Password", 400));

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return next(new ErrorHandler("Invalid Email or Password", 404));

    sendCookie(user, res, `Welcome back, ${user.name}`, 200);
  } catch (error) {
    next(error);
  }
};

//2)REGISTER--------------------------------------------------------------------------------
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    //we are using 'let' here becaz we are going to use 'user' variable again down
    let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("User Already Exists", 400));

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({ name, email, password: hashedPassword });

    //As cookie setter and Co. is used for login also we are moving it to "utils" folder

    // const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // //1000 means 1s so 1s*60*15 =15 mins
    // res
    //   .status(201)
    //   .cookie("token", token, {
    //     httpOnly: true,
    //     maxAge: 15 * 60 * 1000,
    //   })
    //   .json({
    //     success: true,
    //     message: "Registered Successfully",
    //   });

    sendCookie(user, res, "Registered Successfully", 201);
  } catch (error) {
    next(error);
  }
};

//3)GET MY PROFILE-------------------------------------------------------------------------
export const getMyProfile = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

//4)LOGOUT------------------------------------------------------------------
//Set token to an empty string and make it expire now
export const logout = (req, res) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "Development" ? "false" : "true",
    })
    .json({
      success: true,
    });
};
