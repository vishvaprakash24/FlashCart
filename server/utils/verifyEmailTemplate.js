const verifyEmailTemplate = (username, url) => {
    return `
    <p>Hello ${username},</p>
    <p>Thank you for signing up! Please click the link below to verify your email address:</p>
    <a style="color: white; background: blue; margin-top: 10px" href="${url}">Verify Email</a>
    `
}
export default verifyEmailTemplate;
