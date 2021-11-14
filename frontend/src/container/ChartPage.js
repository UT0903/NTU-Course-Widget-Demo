/* eslint-disable import/no-anonymous-default-export */
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import { CONCAT_SERVER_URL } from "../utils";
import PieChart from "../component/PieChart";
import DetailTable from "../component/DetailTable";
import { Row, Col, Button } from "antd";

export default ({ isLogin }) => {
  const { ids } = useParams();
  const coursesId = JSON.parse(ids);
  const grade_name = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "F"];
  const history = useHistory();
  const [activeTab, setActiveTab] = useState({
    semester: null,
    id: null,
  });
  const parseGrade = (grade) => {
    const { partition_line: line, partition_grade: grades } = grade;
    const reducer = (acc, curr, index) => {
      if (curr && index === 8) {
        if (acc.start === index) {
          acc.grade[grade_name[index]] = grades[acc.gradeIndex++] / 100;
        } else {
          acc.grade[`${grade_name[acc.start]}-${grade_name[index]}`] =
            grades[acc.gradeIndex++] / 100;
        }
        acc.grade["F"] = grades[acc.gradeIndex++] / 100;
        acc.start = index + 1;
      } else if (curr) {
        if (acc.start === index) {
          acc.grade[grade_name[index]] = grades[acc.gradeIndex++] / 100;
        } else {
          acc.grade[`${grade_name[acc.start]}-${grade_name[index]}`] =
            grades[acc.gradeIndex++] / 100;
        }
        acc.start = index + 1;
      } else if (index === 8) {
        acc.grade[`${grade_name[acc.start]}-F`] =
          grades[acc.gradeIndex++] / 100;
      }
      return acc;
    };
    return line.reduce(reducer, { grade: {}, start: 0, gradeIndex: 0 }).grade;
  };
  const { data = [] } = useQuery("getCoursesGrade", async () => {
    const { data } = await axios.get(CONCAT_SERVER_URL("/courses/grade"), {
      params: { coursesId },
    });
    const dataWithGrade = data.courses.map((course) => {
      if (course.grade.length === 0) {
        return { ...course, grade: { 未知: 100 } };
      } else {
        return { ...course, grade: parseGrade(course.grade[0]) };
      }
    });
    setActiveTab({
      semester: dataWithGrade[0].semester,
      id: dataWithGrade[0].id,
    });
    return dataWithGrade;
  });
  useEffect(() => {
    if (!isLogin) {
      history.push("/");
    }
  }, [isLogin]);
  const showCourse = data.find(
    (course) =>
      course.semester === activeTab.semester && course.id === activeTab.id
  );
  if (data.length && activeTab.semester && activeTab.id)
    return (
      <>
        <div style={{ alignItems: "center", marginTop: "20px" }}>
          <Row>
            <Col span={16}>
              <div className="Search-charts">
                <PieChart setActiveTab={setActiveTab} courses={data} />
              </div>
            </Col>
            <Col span={8}>
              {showCourse && <DetailTable course={showCourse} />}
            </Col>
          </Row>
        </div>
        <div className="Search-button_wrap">
          <Button
            onClick={() => {
              setActiveTab({
                semester: null,
                id: null,
              });
              history.goBack();
            }}
            type="primary"
          >
            返回上一頁
          </Button>
        </div>
      </>
    );
  return <></>;
};
