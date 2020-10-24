const express = require("express");
const router = express.Router();
const db = require("../models");
var nodemailer = require("nodemailer");

// POST route to send email
router.post("/email", async function (req, res) {
  try {
    if (req.session.user && req.session.user.userType === "gardener") {
      const gardener = await db.Gardener.findOne({where: {id: req.session.user.id}})
      const gardenerJSON = gardener.toJSON()
      const garden = await db.Garden.findOne({ 
        where: { id: req.body.gardenId },
        include: db.Owner  
      })
      const gardenJSON = garden.toJSON()

      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "patchedapp@gmail.com",
          pass: "Project2!",
        },
      });
      // send mail with defined transport object

      let info = await transporter.sendMail({
        from: "patchedapp@gmail.com", // sender address
        to: gardenJSON.Owner.email, // list of receivers
        subject: "Patched Connection", // Subject line
        // text: req.body.emailBody, // plain text body
        html: `${gardenerJSON.username} would like to connect about your garden!
      <br>
      ${req.body.emailBody} 
      <br>
      <a href='http://localhost:8080/gardens/assign/${gardenJSON.id}/${gardenerJSON.id}'>Share your garden</a>`, // html body
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      res.send("Message Sent")
    }
  } catch (err) {
    console.log(err)
    res.status(500).end()
  }

});


module.exports = router;
