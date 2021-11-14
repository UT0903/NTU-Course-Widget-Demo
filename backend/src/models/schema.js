
import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    id: { type: String, required: true, trim: true },
    pwd: { type: String, required: true }
});
const courseSchema = new Schema({
    id: { type: String, required: true, trim: true }, //流水號
    class_name: { type: String, trim: true }, //課名
    class_id: { type: String, required: true, trim: true }, //課程識別碼
    class_num: { type: String, required: true, trim: true }, //班次
    semester: { type: String, required: true, trim: true }, //學年/學期
    limit_student_num: { type: String, trim: true }, //課程限制人數
    reg_student_num: { type: String, trim: true }, //初選登記人數
    study_student_num: { type: String, trim: true }, //最後選上人數
    credit: { type: String, trim: true }, //學分數
    teacher_name: { type: String, trim: true }, //老師
    reg_method: { type: String, trim: true } //加選方式
})
const userCourseSchema = new Schema({
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    course: { type: mongoose.Types.ObjectId, required: true, ref: 'Course' },
    grade: { type: String },
    higher_grade: { type: String },
    lower_grade: { type: String },
    same_grade: { type: String }
})
const courseGradeSchema = new Schema({
    course: { type: mongoose.Types.ObjectId, required: true, ref: 'Course' },
    partition_line:[Boolean],
    partition_grade:[Number]
})
const UserModel = mongoose.model('User', userSchema);
const CourseModel = mongoose.model('Course', courseSchema);
const UserCourseModel = mongoose.model('UserCourse', userCourseSchema);
const CourseGradeModel = mongoose.model('CourseGrade', courseGradeSchema);
export { UserModel, CourseModel, UserCourseModel, CourseGradeModel };