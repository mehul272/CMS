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

router.get('/index', function (req, res) {
    res.render("index");
})

router.get('/game', function (req, res) {
    res.render("game");
})

router.get("/high_scores", function (req, res) {
    res.render("highscores");
})

router.get("/end", function (req, res) {
    res.render("end")
})

router.get("/new_login", function (req, res) {
    res.render("new_login")
})

global.email = "";
global.prn = "";
global.my_name = "";

//login for student
router.post("/login_student", function (req, res) {
    const name = req.body.email;
    const pass = req.body.password;
    email = name;
    try {

        db.query('SELECT * FROM student_register WHERE email= ?', [name], async (error, results) => {
            // console.log(results[0]);
            prn = results[0].PRN
            console.log(prn);

            if (!results || pass != results[0].password) {
                console.log("woring")
            } else {
                const id = results[0].id;
                my_name = results[0].first_name;

                const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
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
                res.render("./student_page/studentlogin", { welcome_name: results[0].first_name })
            };

        })
    } catch (error) {
        console.log(error);
    }

})


router.get("/student-home", function (req, res) {
    res.render("./student_page/studentlogin", { welcome_name: my_name });
})


router.get("/checkattendance", function (req, res) {
    try {
        db.query("SELECT * from student_register WHERE PRN = ?", [prn], function (err, results) {
            if (err) {
                console.log(err)
            }
            res.render("./student_page/checkattendance", {
                user: results[0],
                welcome_name: '',
            })
        })
    } catch (error) {
        console.log(error)
    }
})

router.get("/studentresults", function (req, res) {
    try {
        db.query(" SELECT m.PRN,m.subject_id,m.subject_id2,m.subject_id3,m.subject_id4,m.mid_term_marks,m.end_term_marks,m.pass_fail,c.msubject_id,c.msubject_id2,c.msubject_id3,c.msubject_id4,c.esubject_id,c.esubject_id2,c.esubject_id3,c.esubject_id4,m.psubject_id,m.psubject_id2,m.psubject_id3,m.psubject_id4,m.pesubject_id,m.pesubject_id2,m.pesubject_id3,m.pesubject_id4,m.gsubject_id,m.gsubject_id2,m.gsubject_id3,m.gsubject_id4 FROM marks m INNER JOIN calculate_marks c ON m.PRN = c.PRN WHERE m.PRN = ? ", [prn], function (err, results) {
            if (err) {
                console.log(err)
            }
            console.log(results)
            res.render("./student_page/student_results", {
                user: results[0],
                welcome_name: '',
            })
        })
    } catch (error) {
        console.log(error);
    }
})



router.get('/student_profile_edit', (req, res) => {
    res.sendFile(__dirname + './student_page/student_profile.ejs')
})

router.post("/student_profile_edit", function (req, res) {


    const PRN = req.body.PRN;

    db.query("SELECT * FROM student_info WHERE PRN = ?", [PRN], function (err, result) {

        if (err) {
            console.log(err);
        }

        if (req.files) {
            console.log(req.files);
        }

        db.query(`UPDATE student_info SET Branch = '${req.body.sbranch}', Division = '${req.body.sdivision}',roll_no = '${req.body.sroll}',date_of_admission = '${req.body.sdate}',phone_no = '${req.body.sphone}',resident_city = '${req.body.scity}',gender = '${req.body.sgender}',father_name = '${req.body.sfathername}',mother_name = '${req.body.smothername}' WHERE PRN = ?`, [PRN], function (error, result) {
            if (error) {
                console.log(error);
            }
            return res.redirect("/profile_student")
        })
    })
})


//student_info
router.get("/profile_student", function (req, res) {
    try {
        // console.log(mail);
        db.query("SELECT * FROM student_info WHERE PRN = ?", [prn], (err, results) => {
            if (err) {
                console.log(err);
            }
            console.log(results)
            res.render("./student_page/student_profile", {
                users: results[0],
            })
        })
    } catch (error) {
        console.log(error)
    }
})

router.get("/edit_sprofile/:PRN", function (req, res) {
    const PRN = req.params.PRN;
    db.query("SELECT * FROM student_info WHERE PRN = ?", [PRN], function (err, result) {
        if (err) {
            console.log(err);
        }
        console.log(result)
        res.render("./student_page/student_profile_edit", { user: result[0] })
    })
})

module.exports = router;