function sendEmail(to, subject, message) {
  console.log("\n========================================");
  console.log("          EMAIL THÔNG BÁO");
  console.log("========================================");
  console.log("To      :", to);
  console.log("Subject :", subject);
  console.log("Message :");
  console.log(message);
  console.log("========================================\n");
}

module.exports = { sendEmail };
