const verifyEmailTemplate = ({name, url}) => {
    return `
    <p>Hello ${name},</p>
    <p>Thank you for signing up! Please click the link below to verify your email address:</p>
    <a style="padding: 8px 10px; color: white; background: #071263; margin-top: 10px" href="${url}">Verify Email</a>
    `
}
export default verifyEmailTemplate;
