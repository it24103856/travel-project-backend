import bcrypt from 'bcryptjs';
import User from "../models/User.js"; 
import jwt from "jsonwebtoken";
import axios from "axios";
import crypto from "crypto";
import Otp from '../models/Otp.js';
import nodemailer from "nodemailer";
import dotenv from "dotenv";


dotenv.config();
//otp eka yana email setup karanawa
const transporter=nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    },tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2"
    }
})

// 1. User Registration
export async function registerUser(req, res) {
    try {
        const data = req.body;

        // 1. find email have(can't duplicate email)
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = bcrypt.hashSync(data.password, 10);

        const newUser = new User({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,      
            image: data.image || "/default-profile.png",
        });

        const result = await newUser.save();
        res.status(201).json({
            message: "User created successfully",
            user: result,
        });

    } catch (err) {
        console.error("Register Error:", err); 
        res.status(500).json({
            message: "Error creating user",
            error: err.message,
        });
    }
}
export function isAdmin(req, res) {
    if(req.user == null){
        return false;
    }
    if(req.user.role != "admin"){
        return false;
    }
    console.log("user is admin");
    return true;

}

// 2. User Login
export function loginUser(req, res) {
    const { email, password } = req.body;

    User.findOne({ email: email }).then((user) => {
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (isPasswordValid) {
            const payload = {
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                isemailverified: user.isemailverified,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7h' });
            
            res.json({
                message: "User logged in successfully",
                token: token,
                role: user.role,
            });
        } else {
            res.status(401).json({ message: "Invalid password" });
        }
    }).catch((err) => {
        res.status(500).json({ message: "Error logging in user", error: err.message });
    });
}

// 3. Get User Data
// userController.js එකේ getuser එක මෙහෙම වෙනස් කරන්න
export async function getuser(req, res) {
    try {
        // middleware එකෙන් req.user.email ලැබෙනවා නම්:
        const user = await User.findOne({ email: req.user.email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user); // සම්පූර්ණ user object එකම යවනවා (image එකත් එක්ක)
    } catch (error) {
        res.status(500).json({ message: "Error fetching user data", error: error.message });
    }
}

//get all user data for admin
export async function getAllUsers(req,res){
    try{
        const users=await User.find();
        res.json(users);
    }
    catch(error){
        res.status(500).json({message:"Failed to fetch users",error:error.message})

    }
}



// 4. Google Login (Already mostly correct, just cleaned up)
export async function googlelogin(req, res) {
    const accessToken = req.body.token;
    if (!accessToken) return res.status(400).json({ message: "Missing Google access token" });

    try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const googleUser = response.data;
        let user = await User.findOne({ email: googleUser.email });

        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString("hex");
            const hashedPassword = bcrypt.hashSync(randomPassword, 10);
            user = new User({
                email: googleUser.email,
                firstName: googleUser.given_name || googleUser.name || "Google",
                lastName: googleUser.family_name || "User",
                password: hashedPassword,
                image: googleUser.picture || "/default.jpg",
                isemailverified: true,
            });
            await user.save();
        }
        if(user.isblocked){
            return res.status(403).json({ message: "Your account is blocked. Please contact support." });
        }

        const payload = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image,
            role: user.role,
            isemailverified: user.isemailverified,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.json({ message: "Login successful", token, role: user.role });
    } catch (error) {
        return res.status(500).json({ message: "Google login failed", error: error.message });
    }
}

// otp send

export async function sendOtp(req, res) {
    const email = req.params.email; // URL එකෙන් එන email එක ගන්නවා

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found with email" });
        }

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // පරණ OTP තිබේ නම් මකා දමන්න
        await Otp.findOneAndDelete({ email: email });

        const newOtpEntry = new Otp({
            email: email,
            otp: generatedOtp,
            otpExpiry: otpExpiry
        });
        await newOtpEntry.save();

        // මෙතන EMAIL_USER වෙනුවට EMAIL ලෙස නිවැරදි කරන්න
        const mailOptions = {
            from: process.env.EMAIL, // .env එකේ තියෙන නමම පාවිච්චි කරන්න
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${generatedOtp}. This code is valid for 10 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Mail Error:", error); // ලෙඩේ බලාගන්න console එකට දාන්න
                return res.status(500).json({ message: "Error sending OTP", error: error.message });
            }
            return res.json({ message: "OTP sent successfully!", status: "Email sent" });
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

//validate otp and reset password
export async function validateOtp(req,res){
    try{
        const {email,otp,newPassword}=req.body;

        const otpEntry=await Otp.findOne({email:email,otp:otp});
        if(!otpEntry){
            return res.status(400).json({message:"Invalid OTP"})
        }
        await Otp.deleteOne({email:email,otp:otp});
        const hashedPassword=bcrypt.hashSync(newPassword,10);
        await User.updateOne({email:email},{
            $set:{password:hashedPassword ,isemailverified:true}});
        res.json({message:"Password reset successful"});
    }catch(error){
        res.status(500).json({message:"internal server error",error:error.message})
    }
    
}

