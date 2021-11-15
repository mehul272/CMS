//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const env = require("env")
const mysql = require("mysql")
const dotenv = require("dotenv")

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const cookieParser = require("cookie-parser")

const { promisify } = require('util')

//sending the mails
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const mailGun = require('nodemailer-mailgun-transport');

const app = express();

dotenv.config({ path: "./.env" })

//creating connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password@123',
    database: 'cms',
});

db.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log("connected")
    }
})

const router = express.Router()

//sending mail through gmail api

const CLIENT_ID = "544733704416-oevvsmpacrp4t2v1cirn9oet3fpfpk5u.apps.googleusercontent.com"
const CLIENT_SECRET = "1oCsjUeir9iXRNGy88YDaqWZ"
const REDIRECT_URI = "https://developers.google.com/oauthplayground"
const REFRESH_TOKEN = "1//04glmOa-kQKEdCgYIARAAGAQSNwF-L9IrmS2JY1xa9v-YIt9_FXTi-VoXAEAyYgUyCCxgqAkhjh-A1CeUk-9LvdHFp2visa7WIa8"

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

//changing password by using forget password

//creating the email feature
// const sendreset_link = (email, text, cb2) => {
//     const mailOptions = {
//         from: 'mehulpansari18@gmail.com',
//         to: email,
//         subject: 'Your Reset Link is',
//         text,
//     };

//     transporter.sendMail(mailOptions, (err, data) => {
//         if (err) {
//             cb2(err, null);
//         } else {
//             cb2(null, data);
//         }
//     })
// }

async function sendResetmail() {
    try {
        const ascessTokens = await oAuth2Client.getAccessToken()
        const transport = nodemailer.createTransport({
            service: 'gmail',
            sendmail: true,
            auth: {
                type: 'OAuth2',
                user: 'mehulpansari07@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: ascessTokens
            }
        })

        const mailOp = {
            from: '<mehulpansari07@gmail.com>',
            to: 'mehulpansari18@gmail.com',
            subject: 'Password reset Link',
            text: "text"
        }

        const result = await transport.sendResetmail(mailOp)

    } catch (error) {
        if (error) {
            console.log(error)
        }
    }
}

router.get("/forgotpassword", function(req, res) {
    res.render("forgotpassword");
})

router.post("/forgotpassword", function(req, res) {
    const typed_email = req.body.forgotemail;
    try {
        const { forgotemail } = req.body;

        if (!forgotemail) {
            return res.render("forgotpassword")
        }

        db.query('SELECT * FROM teacher_register WHERE email_id = ?', [typed_email], async(error, results) => {
            if (results == '') {
                return res.send("User is not registered")
            }
            console.log(results)

            const secret = process.env.JWT_SECPASS + results[0].password;

            const payload = {
                email: results[0].email_id,
                id: results[0].id,
            }

            const token = jwt.sign(payload, secret, { expiresIn: '15m' });
            const link = `http://localhost:3000/resetpassword/${results[0].teacher_id}/${token}`
            console.log(link);

            // sendResetmail(function(error, results) {
            //     if (error) {
            //         console.log(error);
            //     } else {
            //         res.send("Reset link Sent")
            //     }
            // })


            res.render("register");

        })
    } catch (error) {
        console.log(error);
    }
})

router.get("/resetpassword/:id/:token", function(req, res) {
    const { id, token } = req.params


    try {
        db.query('SELECT * FROM teacher_register WHERE teacher_id = ?', [id], (error, results) => {
            if (results == '') {
                return res.send("Sorry user does not exist");
            }

            const secret = process.env.JWT_SECPASS + results[0].password;
            try {
                const payload = jwt.verify(token, secret)
                res.render("resetpassword");
            } catch (err) {
                console.log(err)
            }

        })
    } catch (error) {
        console.log(error);
    }
})


router.post("/resetpassword/:id/:token", function(req, res) {
    const { id, token } = req.params;
    // res.render()
    const pass = req.body.reset_password;
    const cpass = req.body.reset_cpassword;

    try {
        db.query('SELECT * FROM teacher_register WHERE teacher_id = ?', [id], (error, results) => {
            if (results == '') {
                return res.send("Sorry user does not exist");
            }

            const secret = process.env.JWT_SECPASS + results[0].password;
            results[0].password = pass
            results[0].cpassword = pass
            db.query(`UPDATE teacher_register SET password = '${pass}', cpassword = '${cpass}' WHERE teacher_id = ?`, [id], function(errors, result) {
                if (errors) {
                    console.log(errors)
                } else {
                    try {
                        const payload = jwt.verify(token, secret)
                        res.status(500).send("Password Changed");
                    } catch (err) {
                        console.log(err)
                    }
                }
            })


        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;