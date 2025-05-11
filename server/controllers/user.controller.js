import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generateAccessToken from '../utils/generateAccessToken.js';
import generateRefreshToken from '../utils/generateRefreshToken.js';
import upload from '../middleware/multer.js';
import uploadImageCloudinary from '../utils/uploadImageCloudinary.js';

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;
    if(!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required" ,
        error: true,
        success: false
      });
    }

    const user = await UserModel.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "Email already registered",
        error: true,
        success: false
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${savedUser?._id}`;
    
    const verifyEmail = await sendEmail({
      sendTo: email, 
      subject: "Verify your email address - FlashCart",
      html: verifyEmailTemplate({
        name,
        url: verifyEmailUrl
      }),
       });

    return res.status(200).json({
      message: "User registered successfully",
      error: false,
      success: true,
      data: savedUser
    });
  } catch (error) {
    return res.status(500).json({ 
        message: error.message || error,
        error: true,
        success: false,
     });
  }
}

export async function verifyEmailController(req, res) {
  try {
    const {code} = req.body;
    const user = await UserModel.findOne({_id: code});

    if(!user){
      return res.status(400).json({
        message: "Invalid code",
        error: true,
        success: false
      })
    }
    const updateUser = await UserModel.updateOne({ _id: code }, {
      verify_email: true
    });

    return res.status(200).json({
      message: "Email verified successfully",
      error: false,
      success: true,
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true, 
      success: false
    })
  }
}

// login controller
export async function loginController(req, res){
  try {
    const {email, password} = req.body;
    if(!email || !password){
      return res.status(400).json({
        message: "All fields are required",
        error: true,
        success: false
      })
    }
    const user = await UserModel.findOne({email})
    if(!user){
      return res.status(400).json({
        message: "User not registered",
        error: true,
        success: false
      })
    }
    if(user.status !== "Active"){
      return res.status(400).json({
        message: "Contact admin to activate your account",
        error: true,
        success: false
      })
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if(!checkPassword){
      return res.status(400).json({
        message: "Invalid password",
        error: true,
        success: false
      })
    }

    const accessToken = await  generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    }
    res.cookie("accessToken", accessToken, cookieOptions)
    res.cookie("refreshToken", refreshToken, cookieOptions)
    
    return res.status(200).json({
      message: "Logged in successfully",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
    
  }
}

// logout controller
export async function logoutController(req, res){
  try {
    const userId = req.userId;

    const cookieOptions = {
      httpOnly: true, 
      secure: true,
      sameSite: "None"
    }

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userId, {refresh_token: ""})
    
    return res.json({
      message: "Logged out successfully",
      error: false,
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
    
  }
}

// upload user avatar
export async function uploadAvatar(req, res) {
  try {
    const userId = req.userId; // auth middleware
    const image = req.file; // multer middleware
    const upload = await uploadImageCloudinary(image);

    const updateUser = await UserModel.findByIdAndUpdate(userId, {userId, avatar: upload?.url });
    return res.json({
      message: "upload profile",
      data: {
        _id: userId,
        avatar: upload.url
      }
    })
    
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

// update user details
export async function updateUserDetails(req, res){
  try {
    const userId = req.userId; // auth middleware
    const {name, email, mobile, password} = req.body;
    
    if(password){
      
    }
    const updateUser = await UserModel.findByIdAndUpdate(userId, {
      ...(name && {name}),
      ...(email && {email}),
      ...(mobile && {mobile}),
      ...(password && {password: await bcrypt.hash(password, 10)})
    }, {new: true});
    
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}