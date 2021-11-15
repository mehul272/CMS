//conatin my student routes
const express = require("express")
const mysql = require("mysql")
const dotenv = require("dotenv")

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const cookieParser = require("cookie-parser")
const ejs = require("ejs");

const { promisify } = require('util')



dotenv.config({ path: "./.env" })
//refactoring the code with the help of router
const router = express.Router()

router.use(cookieParser())

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

router.get('/add', function (req, res) {
    res.render("new_registration")
})

router.get('/student_forgotpassword', function (req, res) {
    return res.status(400).send("Please Contact Your Organization")
})

//connecting app.js with the attendance.ejs and displaying the table


router.post("/save", function (req, res) {

    var today = new Date();

    var my_date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    let data = { email: req.body.email, password: req.body.password, PRN: req.body.PRN, first_name: req.body.first_name, last_name: req.body.last_name, date_registered: my_date }
    let sql = "INSERT INTO student_register SET ?"
    let sql2 = "INSERT INTO marks SET ?"
    let sql3 = "INSERT INTO calculate_marks SET ?"
    let sql4 = "INSERT INTO student_info SET ?"
    let data2 = { PRN: req.body.PRN }
    let data3 = { PRN: req.body.PRN, first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email }
    try {
        db.query(sql, data, function (error, results) {
            if (error) {
                console.log(error);
            }
            db.query(sql2, data2, (err, result) => {
                if (error) {
                    console.log(err)
                }
            })
            db.query(sql3, data2, (err, result) => {
                if (error) {
                    console.log(err)
                }
            })
            db.query(sql4, data3, (err, result) => {
                if (err) {
                    console.log(err);
                }
            })
            res.redirect('/attendance', { today_date: my_date })
        })
    } catch (error) {
        console.log(error)
    }
})



router.get('/attendance', function (req, res) {
    try {
        db.query("SELECT * FROM student_register", (err, results) => {
            if (err) {
                console.log(err)
            }
            // console.log(results)
            res.render("attendance", {
                users: results,
                welcome_name: ''
            })

        })
    } catch (error) {
        console.log(error)
    }
})

router.get("/delete/:userid", function (req, res) {
    const userid = req.params.userid;
    db.query("DELETE FROM student_register WHERE PRN = ?", [userid], function (error, results) {
        if (error) {
            console.log(error)
        }
        db.query("DELETE FROM marks WHERE PRN = ?", [userid], function (err, result) {
            if (err) {
                console.log(err)
            }
        })
        db.query("DELETE FROM calculate_marks WHERE PRN = ?", [userid], function (err, result) {
            if (err) {
                console.log(err)
            }
        })
        db.query("DELETE FROM student_info WHERE PRN = ?", [userid], function (err, result) {
            if (err) {
                console.log(err)
            }
        })
        console.log("deleted_attendence")
        return res.redirect("/attendance")
    })

})

// drop procedure if exists my_pro;
// delimiter $
// create procedure my_pro(in userid int)  
// begin
// declare today date;
// declare my_date date;
// declare diff_date date;
// declare present int;
// set today = sysdate();
// select date_registered,present_days into my_date,present from student_register where PRN = userid;
// set diff_date = timestampdiff(day,today,my_date);
// if diff_date != 0 then
// 	set present = present+1;
// 	update student_register set present_days = present where PRN = userid;
// end if;
// end$

// delimiter ;

router.get("/present/:userid", function (req, res) {
    const userid = req.params.userid;
    var present = 0;
    var total = 0;
    db.query("SELECT * FROM student_register WHERE PRN = ?", [userid], function (error, results) {
        if (error) {
            console.log(error)
        }
        present = Number(results[0].present_days);
        total = Number(results[0].total_days)

        present = present + 1
        total = total + 1

        db.query(`UPDATE student_register SET present_days = '${present}', total_days = '${total}' WHERE PRN = ?`, [userid], (err, result) => {
            if (err) {
                console.log(err)
            }
            console.log("Marked Present")
        })
        return res.redirect("/attendance")
    })
})


router.get("/absent/:userid", function (req, res) {
    const userid = req.params.userid;
    var total = 0;
    db.query("SELECT * FROM student_register WHERE PRN = ?", [userid], function (error, results) {
        if (error) {
            console.log(error)
        }
        total = Number(results[0].total_days)
        total = total + 1

        db.query(`UPDATE student_register SET total_days = '${total} 'WHERE PRN = ?`, [userid], (err, result) => {
            if (err) {
                console.log(err)
            }
            console.log("Marked Absent")
        })
        return res.redirect("/attendance")
    })
})






// app.get("/edit/:userid", function(req, res) {
//     const userid = req.params.userid;
//     db.query("SELECT * FROM student_regis WHERE id= ?", [userid], function(error, results) {
//         if (error) {
//             console.log(error)
//         }
//         res.render("update_student", {
//             user: results[0]
//         })
//     })
// })

// app.post("/update", function(req, res) {
//     const userid = req.body.id;

//     db.query("SELECT * FROM student_regis WHERE id= ?", [userid], function(err, result) {
//         if (err) {
//             console.log(err);
//         }
//         db.query(`UPDATE student_regis SET username='${req.body.username}', email='${req.body.email}' WHERE id =?`, [userid], function(err, results) {
//             if (err) {
//                 console.log(err)
//             }
//             return res.redirect("/attendance")
//         })
//     })
// })

module.exports = router;