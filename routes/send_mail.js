const express = require("express")
const mysql = require("mysql")
const dotenv = require("dotenv")

const jwt = require("jsonwebtoken");

const ejs = require("ejs");


const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const mailGun = require('nodemailer-mailgun-transport');


dotenv.config({ path: "./.env" })
    //refactoring the code with the help of router
const router = express.Router()

const auth = {
    auth: {
        api_key: '835b7bf0813c15bc9a03ba1792effd57-64574a68-ce05f70a',
        domain: 'sandbox4b736710fc5840c7a638a8676e0eec3b.mailgun.org',
    }
}

const transporter = nodemailer.createTransport(mailGun(auth))

//sending emails

const sendMail = (email, mname, phone, text, cb) => {
    const mailOptions = {
        from: email,
        to: 'mehulpansari18@gmail.com',
        subject: 'CMS Data Contact',
        mname,
        phone,
        text,
    };

    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    })
}

//send mail
router.post('/email', (req, res) => {
    const message_name = req.body.txtName
    const message_email = req.body.txtEmail
    const message_phone = req.body.txtPhone
    const message_text = req.body.txtMsg

    console.log(message_name)
    console.log(message_email)
    console.log(message_phone)
    console.log(message_text)

    sendMail(message_email, message_name, message_phone, message_text, function(err, results) {
        if (err) {
            console.log(err)
        } else {
            console.log("emailsent");
        }
    })
})

module.exports = router;