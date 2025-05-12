const forgotPasswordTemplate = ({name, otp}) => {
    return `<p>Hi ${name},</p>
             <p>Your OTP for reset password is <strong>${otp}</strong></p>
             <p>It will expire in 60 minutes</p>
             <p>If you didn't request this, please ignore this email.</p>
             <br>
             <br>
             <p>Thanks,</p>
             <p>FlashCart Team</p>`
}

export default forgotPasswordTemplate;