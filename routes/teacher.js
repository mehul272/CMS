//conatin my teacher routes
const express = require("express")
const mysql = require("mysql")
const dotenv = require("dotenv")

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const cookieParser = require("cookie-parser")
const ejs = require("ejs");

const upload = require('express-fileupload');

const { promisify } = require('util')
const multer = require("multer");
const { storage } = require("googleapis/build/src/apis/storage");


dotenv.config({ path: "./.env" })

//refactoring the code with the help of router
const router = express.Router()

router.use(cookieParser())

router.use(upload())

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
        // console.log("connected")
    }
})

router.get("/", function(req, res) {
    res.render("home")
})

router.get("/register", function(req, res) {
    res.render("register")
})

router.get("/login", function(req, res) {
    res.render("login")
})
global.mail = "";

//registration
router.post("/register", function(req, res) {
    const email = req.body.email_id;
    const fname = req.body.first_name;
    const lname = req.body.last_name;
    const teacher_id = req.body.teacher_id;
    const pass = req.body.password;
    const cpass = req.body.cpassword;
    mail = email;
    const { username, password } = req.body;


    db.query('SELECT email_id FROM teacher_register WHERE teacher_id = ?', [teacher_id], async(error, result) => {
        if (error) {
            console.log(error);
        }

        if (result.length > 0) {
            return res.render('register')
        } else if (pass != cpass) {
            return res.send('Password Do not Match');
        }

        let hasedpassword = await bcrypt.hash(pass, 8)
        console.log(hasedpassword)

        db.query('INSERT INTO teacher_register SET ?', { email_id: email, password: pass, first_name: fname, last_name: lname, teacher_id: teacher_id, cpassword: cpass }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                db.query('INSERT INTO teacher_info SET ?', { teacher_email: email, first_name: fname, last_name: lname, teacher_id: teacher_id }, function(err, result) {
                    if (err) {
                        console.log(err)
                    }
                })
                console.log("scuess")
                res.render("secrets", { welcome_name: fname })
            }
        })
    });

})


global.my_name = "";
//login 
router.post("/login", function(req, res) {
    const name = req.body.username;
    const pass = req.body.password;
    mail = name;
    try {
        // const { username, password } = req.body;

        // if (!username || !password) {
        //     return res.render("register")
        // }

        db.query('SELECT * FROM teacher_register WHERE email_id = ?', [name], async(error, results) => {
            console.log(results);
            console.log(pass)
            console.log(results[0].password)
            if (!results || pass != results[0].password) {
                console.log("woring")
            } else {
                const id = results[0].teacher_id;

                const token = jwt.sign({ teacher_id: id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                })

                console.log("Token: " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
                    ),
                    httpOnly: true
                }

                res.cookie('jwt', token, cookieOptions);
                console.log("looged")
                my_name = results[0].first_name;
                res.render("secrets", { welcome_name: results[0].first_name })
            };

        })
    } catch (error) {
        console.log(error);
    }

})

//using the cookies
router.get("/secrets", async function(req, res, next) {
    console.log(req.cookies)
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
            console.log(decoded)

            //user exists or not
            db.query('SELECT * FROM teacher_register WHERE teacher_id = ?', [decoded.id], (error, result) => {
                console.log(result)

                if (!result) {
                    return next();
                }

                req.user = result[0];
                return next();
            });

        } catch (error) {
            console.log(error)
            return next();
        }
    } else {
        next();
    }

})

//accessing the page with the help of cookie
router.get("/secrets", (req, res) => {
    if (req.user) {
        res.render('secrets', { welcome_name: req.user.first_name });
    } else {
        res.redirect("/register")
    }
})

router.get("/open_home", (req, res) => {
    console.log(my_name)
    res.render('secrets', { welcome_name: my_name });

})

//logout function
router.get("/logout", (req, res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true
    });

    res.status(200).redirect("/")
})



// router.use(fileUpload())
// const upload_image = multer({ storage: multer.memoryStorage() });

router.get('/teacher_profile_edit', (req, res) => {
    res.sendFile(__dirname + '/teacher_info/pr.ejs')
})

router.post("/teacher_profile_edit", function(req, res) {


    const teacher_id = req.body.teacherid;

    db.query("SELECT * FROM teacher_info WHERE teacher_id = ?", [teacher_id], function(err, result) {

        if (err) {
            console.log(err);
        }

        if (req.files) {
            console.log(req.files);
        }

        db.query(`UPDATE teacher_info SET teacher_mobile = '${req.body.pmobile}',teacher_gender = '${req.body.pgender}' WHERE teacher_id = ?`, [teacher_id], function(error, result) {
            if (error) {
                console.log(error);
            }
            return res.redirect("/profile_teacher")
        })
    })
})

//teacher_info
router.get("/profile_teacher", function(req, res) {
    try {
        // console.log(mail);
        db.query("SELECT * FROM teacher_info WHERE teacher_email = ?", [mail], (err, results) => {
            if (err) {
                console.log(err);
            }
            console.log(results)
            res.render("./teacher_info/pr", {
                users: results[0],
            })
        })
    } catch (error) {
        console.log(error)
    }
})


router.get("/edit_profiles/:teacherid", function(req, res) {
    const teacherid = req.params.teacherid;
    console.log(teacherid)
    db.query("SELECT * FROM teacher_info WHERE teacher_id = ?", [teacherid], function(err, result) {
        if (err) {
            console.log(err);
        }
        console.log(result)
        res.render("./teacher_info/editpage/pr-edit", { user: result[0] })
    })
})



module.exports = router;