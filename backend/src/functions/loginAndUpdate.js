import { spawnSync, spawn, exec } from "child_process";
import printLog from "./printLog";
import { encrypt, decrypt } from "./crypto";
import mongoose from "mongoose";
import {
  UserModel,
  CourseModel,
  UserCourseModel,
  CourseGradeModel,
} from "../models/schema";

const try_login = (acc, pwd, res, funcType) => {
  console.log("try login");
  const inputCheck = (acc, pwd) => {
    if (acc == null || pwd == null) return false;
    if (acc.indexOf(" ") >= 0) return false;
    if (pwd.indexOf(" ") >= 0) return false;
    return true;
  };
  if (!inputCheck(acc, pwd)) {
    res.status(200).send("invalid input, login failed");
    return;
  }
  const opt = {
    cwd: process.cwd(),
    env: process.env,
    stdio: "pipe",
    encoding: "utf-8",
  };
  const child = spawn("python3", [`utils/try_login.py`, acc, pwd], opt);
  child.stdin.setEncoding("utf-8");
  child.stdin.write(`${acc} ${pwd}\n`);
  child.stdin.end();
  const timeout = setTimeout(() => {
    child.kill();
    res.status(200).send("timeout, login failed");
    console.log("time out");
  }, 15000);
  child.stdout.on("data", async (data) => {
    clearTimeout(timeout);
    data = data.toString("utf8");
    if (data === "ok\n") {
      console.log("login success");
      let user = await UserModel.findOne({ id: acc, pwd: encrypt(pwd) });
      if (!user) {
        user = await new UserModel({ id: acc, pwd: encrypt(pwd) }).save();
      }
      if (funcType === "craw_grade") {
        res.status(200).send("login success");
        craw_grade(acc, pwd, user);
      } else if (funcType === "get_todos") {
        get_todos(acc, pwd, res);
      }
    } else {
      res.status(200).send("login failed");
    }
  });
};
const craw_grade = (acc, pwd, user) => {
  console.log("craw grade start");
  const opt = {
    cwd: process.cwd(),
    env: process.env,
    stdio: "pipe",
    encoding: "utf-8",
  };
  const child = spawn("python3", [`utils/grade.py`], opt);
  child.stdin.setEncoding("utf-8");
  child.stdin.write(`${acc} ${pwd}\n`);
  child.stdin.end();
  const timeout = setTimeout(() => {
    child.kill();
    console.log("time out");
  }, 60000);
  var dataString = "";
  child.stdout.on("data", async (data) => {
    clearTimeout(timeout);
    try {
      data = data.toString("utf8");
      dataString += data;
    } catch {
      printLog(`cannot parse ${data}`);
      return;
    }
  });
  child.stdout.on("end", async () => {
    try {
      dataString = JSON.parse(dataString);
      const { status, msg } = dataString;
      if (status === "success" && msg !== []) {
        //console.log(data)
        for (let i = 0; i < msg.length; i++) {
          const course = await CourseModel.findOne(msg[i].key);
          if (!course) {
            printLog(
              `loginAndUpdate.js acc: ${acc}` + JSON.stringify(msg[i].origin)
            );
            continue;
          }
          //console.log(course)
          const ucobj = msg[i].val;
          //console.log(ucobj, typeof(ucobj))
          ucobj["user"] = user;
          ucobj["course"] = course;
          //await new UserCourseModel(ucobj).save()
          //console.log('ucobj', ucobj);
          const userCourse = await UserCourseModel.findOne({ user, course });
          if (!userCourse) {
            await new UserCourseModel(ucobj).save();
          }
          const courseGrade = await CourseGradeModel.findOne({ course });
          //console.log('before update', courseGrade)
          const newGradeObj = updateGradeObj(
            courseGrade,
            ucobj["grade"],
            Math.round(parseFloat(ucobj["lower_grade"]) * 100),
            Math.round(parseFloat(ucobj["same_grade"]) * 100),
            Math.round(parseFloat(ucobj["higher_grade"]) * 100)
          );
          //console.log('after update', newGradeObj)
          if (!courseGrade) {
            newGradeObj["course"] = course;
            await new CourseGradeModel(newGradeObj).save();
          } else {
            newGradeObj["course"] = course;
            await CourseGradeModel.updateOne({ course }, newGradeObj);
          }
        }
        printLog(`loginAndUpdate.js ${acc} get grade finish`);
      }
    } catch {
      printLog(`cannot parse ${dataString}`);
      return;
    }
  });
};
const updateGradeObj = (curObj, grade, lower, same, higher) => {
  if (curObj === null) {
    curObj = {};
    curObj["partition_line"] = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
    curObj["partition_grade"] = [10000];
  }
  const updateObj = (curObj, line, left, right) => {
    //console.log(line, left, right)
    if (curObj["partition_line"][line] === false) {
      const devideIdx = curObj["partition_line"].filter(
        (item, idx) => idx < line && item === true
      ).length;

      const left_sum = curObj["partition_grade"]
        .filter((item, idx) => item !== -1 && idx < devideIdx)
        .reduce((a, b) => a + b, 0);
      const new_left = left - left_sum;
      const right_sum = curObj["partition_grade"]
        .filter((item, idx) => item !== -1 && idx > devideIdx)
        .reduce((a, b) => a + b, 0);
      const new_right = right - right_sum;

      curObj["partition_line"][line] = true;
      //console.log('devideIdx', devideIdx, 'new_left', new_left, 'new_right', new_right)
      const l = curObj["partition_grade"].filter((i, idx) => idx < devideIdx);
      const m = [new_left, new_right];
      const r = curObj["partition_grade"].filter((i, idx) => idx > devideIdx);
      const lm = l.concat(m);
      const lmr = lm.concat(r);
      curObj["partition_grade"] = lmr;
      //console.log('lmr', lmr)
    }
    return curObj;
  };
  if (grade === "A+") {
    curObj = updateObj(curObj, 0, higher + same, lower);
  } else if (grade === "A") {
    curObj = updateObj(curObj, 0, higher, same + lower);
    curObj = updateObj(curObj, 1, higher + same, lower);
  } else if (grade === "A-") {
    curObj = updateObj(curObj, 1, higher, same + lower);
    curObj = updateObj(curObj, 2, higher + same, lower);
  } else if (grade === "B+") {
    curObj = updateObj(curObj, 2, higher, same + lower);
    curObj = updateObj(curObj, 3, higher + same, lower);
  } else if (grade === "B") {
    curObj = updateObj(curObj, 3, higher, same + lower);
    curObj = updateObj(curObj, 4, higher + same, lower);
  } else if (grade === "B-") {
    curObj = updateObj(curObj, 4, higher, same + lower);
    curObj = updateObj(curObj, 5, higher + same, lower);
  } else if (grade === "C+") {
    curObj = updateObj(curObj, 5, higher, same + lower);
    curObj = updateObj(curObj, 6, higher + same, lower);
  } else if (grade === "C") {
    curObj = updateObj(curObj, 6, higher, same + lower);
    curObj = updateObj(curObj, 7, higher + same, lower);
  } else if (grade === "C-") {
    curObj = updateObj(curObj, 7, higher, same + lower);
    curObj = updateObj(curObj, 8, higher + same, lower);
  } else if (grade === "F") {
    curObj = updateObj(curObj, 8, higher, same + lower);
  } else {
    printLog("error in newGradeObj");
  }
  return curObj;
};
const get_todos = (acc, pwd, res) => {
  console.log("get todos start");
  const opt = {
    cwd: process.cwd(),
    env: process.env,
    stdio: "pipe",
    encoding: "utf-8",
  };
  const child = spawn("python3", [`utils/hwdue.py`], opt);
  child.stdin.setEncoding("utf-8");
  child.stdin.write(`${acc} ${pwd}\n`);
  child.stdin.end();
  const timeout = setTimeout(() => {
    child.kill();
    console.log("time out");
    res.status(200).send("time out");
  }, 30000);
  var dataString = "";
  child.stdout.on("data", async (data) => {
    clearTimeout(timeout);
    try {
      data = data.toString("utf8");
      dataString += data;
      // data = JSON.parse(data);
      //console.log("dataString", dataString);
    } catch {
      //   printLog(`cannot parse ${String(data)}`);
      res.status(200).send("data parsing error");
      return;
    }
    // res.status(200).send(JSON.stringify(data));
  });
  child.stdout.on("end", () => {
    try {
      dataString = JSON.parse(dataString);
      res.status(200).send(JSON.stringify(dataString));
      return;
    } catch {
      res.status(200).send("data parsing error");
      return;
    }
  });
};

const test = async () => {
  const ucobjs = await UserCourseModel.find({});
  //const courseGrades = await CourseGradeModel.find({})
  //console.log(ucobj)
  for (let i = 0; i < 1; i++) {
    //const ucobj = ucobjs[i]
    //const oldObj = null
    const ucobj = {
      grade: "A",
      lower_grade: "37.37",
      same_grade: "10",
      higher_grade: "52.63",
    };
    const oldObj = {
      partition_line: [
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      partition_grade: [5263, 4737],
    };
    console.log("before", oldObj);
    console.log(parseFloat(ucobj["lower_grade"]) * 100);
    const newGradeObj = updateGradeObj(
      oldObj,
      ucobj["grade"],
      Math.round(parseFloat(ucobj["lower_grade"]) * 100),
      Math.round(parseFloat(ucobj["same_grade"]) * 100),
      Math.round(parseFloat(ucobj["higher_grade"]) * 100)
    );
    console.log("after update", newGradeObj);
  }
};
export { try_login, test };
