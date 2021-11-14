import { Router } from "express";
import mongoose from "mongoose";
import { CourseGradeModel, CourseModel } from "../models/schema";
const router = Router();

router.get("/", async (req, res) => {
  const { current, courseName, max } = req.query;
  const maxCourse = parseInt(max);
  if (courseName) {
    const queryCount = await CourseModel.find({
      class_name: { $regex: courseName, $options: "i" },
    }).countDocuments();
    // const total =
    //   parseInt(queryCount / maxCourse) + (queryCount % maxCourse > 0);
    if (queryCount !== 0) {
      const courses = await CourseModel.find({
        class_name: { $regex: courseName, $options: "i" },
      })
        .skip((current - 1) * maxCourse)
        .limit(maxCourse);
      res.status(200).send({ courses, total: queryCount });
    } else {
      res.status(200).send({ courses: [], total: 0 });
    }
  } else {
    const queryCount = await CourseModel.find({}).countDocuments();
    console.log(queryCount);
    // const total =
    //   parseInt(queryCount / maxCourse) + (queryCount % maxCourse > 0);
    const courses = await CourseModel.find({})
      .skip((current - 1) * maxCourse)
      .limit(maxCourse);
    res.status(200).send({ courses, total: queryCount });
  }
});

router.get("/grade", async (req, res) => {
  const { coursesId } = req.query;
  const ObjectIdArray = coursesId.map((id) => mongoose.Types.ObjectId(id));
  // const courses = await CourseModel.find({ _id: { $in: IdArray } });
  // const coursegrade = await CourseModel.find({ _id: { $in: IdArray } }).lookup({
  //   from: "coursegrades",
  //   localField: "course",
  //   foreignField: "_id",
  //   as: "grade",
  // });
  CourseModel.aggregate()
    .lookup({
      from: "coursegrades",
      localField: "_id",
      foreignField: "course",
      as: "grade",
    })
    .match({ _id: { $in: ObjectIdArray } })
    .then((data) => {
      res.status(200).send({ courses: data });
      // console.log(data);
    })
    .catch((e) => {
      console.log(e);
      res.status(200).send({ courses: [] });
    });
  // console.log(courses);
  // const grade = coursegrade.map(
  //   ({ partition_line: line, partition_grade: grade }) => {}
  // );
  // res.status(200).send({ courses });
});

export default router;
