import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';

export async function registerUserController(req, res) {
  try {
    const { username, email, password } = req.body;
    if(!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required" ,
        error: true,
        success: false
      });
    }

    const user = await UserModel.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
        error: true,
        success: false
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${savedUser._id}`;
    
    const verifyEmail = await sendEmail({
      sendTo: email, 
      subject: "Verify your email address",
      html: verifyEmailTemplate({
        username,
        url: verifyEmailUrl
      }),
       })
       return res.status(200).json({
        message: "User created successfully",
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