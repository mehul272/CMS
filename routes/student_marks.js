const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mysql = require("mysql");
const { use } = require("passport");

const router = express.Router();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password@123',
    database: 'cms',
})

db.connect((err) => {
    if (err) {
        throw err;
    } else {
        // console.log("connected")
    }
})



router.get("/marks_calculate", function(req, res) {
    res.render("add_marksandcalculate")
})

router.post("/add_marks", function(req, res) {
    let data = { PRN: req.body.PRN, subject_id: req.body.SubjectID, subject_id2: req.body.SubjectID2, subject_id3: req.body.SubjectID3, subject_id4: req.body.SubjectID4 }
    let sql = "INSERT INTO marks SET ?";
    // let sql2 = "INSERT INTO calculate_marks SET ?";
    let data2 = { PRN: req.body.PRN }
    try {
        db.query(sql, data, (error, results) => {
            if (error) {
                console.log(error)
            }
            // db.query(sql2, data2, (err, result) => {
            //     if (error) {
            //         console.log(err)
            //     }
            // })
            res.redirect("marks");
        })
    } catch (error) {
        console.log(error)
    }
})

router.get("/marks", function(req, res) {
    try {
        db.query("SELECT * FROM marks", (err, results) => {
            if (err) {
                console.log(err);
            }
            res.render("marks", {
                users: results,
            })
        })
    } catch (error) {
        console.log(error)
    }
})

router.get("/edit_marks/:userid", function(req, res) {
    const userid = req.params.userid;

    db.query("SELECT * FROM marks WHERE PRN = ?", [userid], function(err, results) {
        if (err) {
            console.log(err);
        }
        res.render("update_marks", {
            user: results[0]
        })
    })
})

router.post("/update_markss", function(req, res) {
    const userid = req.body.PRN;
    console.log(userid)

    let data = { PRN: req.body.PRN, subject_id: req.body.SubjectID, subject_id2: req.body.SubjectID2, subject_id3: req.body.SubjectID3, subject_id4: req.body.SubjectID4 }

    db.query("SELECT * FROM marks WHERE PRN = ?", [userid], function(err, result) {

        if (err) {
            console.log(err);
        }
        db.query(`UPDATE marks SET PRN = '${req.body.PRN}',subject_id = '${req.body.SubjectID}',subject_id2 = '${req.body.SubjectID2}',subject_id3 = '${req.body.SubjectID3}',subject_id4 = '${req.body.SubjectID4}' WHERE PRN = ?`, [userid], function(error, result) {
            if (error) {
                console.log(error);
            }
            console.log("editted");
            return res.redirect("/marks")
        })
    })
})

//calculate marks


router.get("/add_mark", function(req, res) {
    try {
        db.query("SELECT * FROM calculate_marks", (err, results) => {
            if (err) {
                console.log(err);
            }
            res.render("add_mark", {
                users: results,
            })
        })
    } catch (error) {
        console.log(error)
    }
})


router.get("/marks_calculate/:userid", function(req, res) {
    const userid = req.params.userid;

    db.query("SELECT * FROM calculate_marks WHERE PRN = ?", [userid], function(err, results) {
        if (err) {
            console.log(err);
        }
        res.render("add_marksandcalculate", {
            user: results[0]
        })
    })
})


router.post("/add_markscalculate", function(req, res) {
    const userid = req.body.PRN;
    console.log(userid)

    let data = { PRN: req.body.PRN, msubject_id: req.body.MSubjectID, msubject_id2: req.body.MSubjectID2, msubject_id3: req.body.MSubjectID3, msubject_id4: req.body.MSubjectID4, esubject_id: req.body.ESubjectID, esubject_id2: req.body.ESubjectID2, esubject_id3: req.body.ESubjectID3, esubject_id4: req.body.ESubjectID4 }

    db.query("SELECT * FROM calculate_marks WHERE PRN = ?", [userid], function(err, result) {

        if (err) {
            console.log(err);
        }
        db.query(`UPDATE calculate_marks SET PRN = '${req.body.PRN}',msubject_id = '${req.body.MSubjectID}',msubject_id2 = '${req.body.MSubjectID2}',msubject_id3 = '${req.body.MSubjectID3}',msubject_id4 = '${req.body.MSubjectID4}',esubject_id = '${req.body.ESubjectID}',esubject_id2 = '${req.body.ESubjectID2}',esubject_id3 = '${req.body.ESubjectID3}',esubject_id4 = '${req.body.ESubjectID4}' WHERE PRN = ?`, [userid], function(error, result) {
            if (error) {
                console.log(error);
            }
            console.log(result)
            db.query("SELECT * FROM calculate_marks WHERE PRN = ?", [userid], (err, results) => {
                if (err) {
                    console.log(err)
                }
                let msubject_id_marks = Number(results[0].msubject_id);
                let msubject_id2_marks = Number(results[0].msubject_id2);
                let msubject_id3_marks = Number(results[0].msubject_id3);
                let msubject_id4_marks = Number(results[0].msubject_id4);
                let esubject_id_marks = Number(results[0].esubject_id);
                let esubject_id2_marks = Number(results[0].esubject_id2);
                let esubject_id3_marks = Number(results[0].esubject_id3);
                let esubject_id4_marks = Number(results[0].esubject_id4);

                let mid_marks = (msubject_id_marks + msubject_id2_marks + msubject_id3_marks + msubject_id4_marks) / 60 * 100;
                let end_marks = (esubject_id_marks + esubject_id2_marks + esubject_id3_marks + esubject_id4_marks) / 200 * 100;
                console.log(mid_marks);
                console.log(end_marks);

                let pmsubject_id = (msubject_id_marks / 15) * 100;
                let pmsubject_id2 = (msubject_id2_marks / 15) * 100;
                let pmsubject_id3 = (msubject_id3_marks / 15) * 100;
                let pmsubject_id4 = (msubject_id4_marks / 15) * 100;

                let pesubject_id = (esubject_id_marks / 50) * 100;
                let pesubject_id2 = (esubject_id2_marks / 50) * 100;
                let pesubject_id3 = (esubject_id3_marks / 50) * 100;
                let pesubject_id4 = (esubject_id4_marks / 50) * 100;

                let grade_subject_id = "";
                let grade_subject_id2 = "";
                let grade_subject_id3 = "";
                let grade_subject_id4 = "";

                let pass = "";
                if (end_marks > 46) {
                    pass = "Pass";
                } else if (end_marks == 0) {
                    pass = "";
                } else {
                    pass = "Fail";
                }

                if (pesubject_id == 0) {
                    grade_subject_id = "";
                } else if (pesubject_id > 80) {
                    grade_subject_id = "A";
                } else if (pesubject_id > 70) {
                    grade_subject_id = "C";
                } else if (pesubject_id > 60) {
                    grade_subject_id = "D"
                } else {
                    grade_subject_id = "E";
                }

                if (pesubject_id2 == 0) {
                    grade_subject_id2 = "";
                } else if (pesubject_id2 > 80) {
                    grade_subject_id2 = "A";
                } else if (pesubject_id2 > 70) {
                    grade_subject_id2 = "C";
                } else if (pesubject_id2 > 60) {
                    grade_subject_id2 = "D"
                } else {
                    grade_subject_id2 = "E";
                }

                if (pesubject_id3 == 0) {
                    grade_subject_id3 = "";
                } else if (pesubject_id3 > 80) {
                    grade_subject_id3 = "A";
                } else if (pesubject_id3 > 70) {
                    grade_subject_id3 = "C";
                } else if (pesubject_id3 > 60) {
                    grade_subject_id3 = "D"
                } else {
                    grade_subject_id3 = "E";
                }

                if (pesubject_id4 == 0) {
                    grade_subject_id4 = "";
                } else if (pesubject_id4 > 80) {
                    grade_subject_id3 = "A";
                } else if (pesubject_id4 > 70) {
                    grade_subject_id4 = "C";
                } else if (pesubject_id4 > 60) {
                    grade_subject_id4 = "D"
                } else {
                    grade_subject_id4 = "E";
                }


                db.query(`UPDATE marks SET mid_term_marks = '${mid_marks}', end_term_marks = '${end_marks}',pass_fail = '${pass}',psubject_id ='${pmsubject_id}',psubject_id2 = '${pmsubject_id2}',psubject_id3 = '${pmsubject_id3}',psubject_id4 = '${pmsubject_id4}',pesubject_id = '${pesubject_id}',pesubject_id2 = '${pesubject_id2}',pesubject_id3 = '${pesubject_id3}',pesubject_id4 = '${pesubject_id4}',gsubject_id ='${grade_subject_id}',gsubject_id2 = '${grade_subject_id2}',gsubject_id3 = '${grade_subject_id3}',gsubject_id4 = '${grade_subject_id4}' WHERE PRN = ?`, [results[0].PRN], (errr, resul) => {
                    if (errr) {
                        console.log(errr)
                    }
                    console.log("done");
                    return res.redirect("/marks")

                })

            })
            console.log("added");

        })
    })
})



module.exports = router;