//jshint esversion:6
// waRd7_Zcjq8@Hm!
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload")
const moment = require("moment");

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(fileUpload())

const router_teacher = require("./routes/teacher.js")

app.use(router_teacher)

const router_student = require("./routes/student.js")

app.use(router_student)

const router_sendmail = require("./routes/send_mail.js")

app.use(router_sendmail)

const router_forgot_password = require("./routes/forgot_password.js")

app.use(router_forgot_password)


const router_student_marks_results = require("./routes/student_marks.js")

app.use(router_student_marks_results)


const router_student_page = require("./routes/student_page.js")

app.use(router_student_page)

const router_mybot = require("./routes/chat.js")

app.use(router_mybot)

app.listen(3000, function() {
    console.log("Sucessfully started port on 3000")
})