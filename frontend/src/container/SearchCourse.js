import "./SearchCourse.css";
import { useEffect, useState } from "react";
import axios from "axios";
import SearchTable from "../component/SearchTable";
import SelectedTable from "../component/SelectedTable";
import SearchBar from "../component/SearchBar";
import { Modal, message } from "antd";
import { CONCAT_SERVER_URL } from "../utils";
import { useQuery } from "react-query";
import {
  useQueryParams,
  NumberParam,
  StringParam,
  withDefault,
} from "use-query-params";
import { useHistory } from "react-router-dom";
const MAX_TABLE_NUM = 10;
const SearchCourse = ({ userInfo, setModalShow }) => {
  const [selected, setSelected] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [total, setTotal] = useState(1);
  const [query, setQuery] = useQueryParams({
    current: withDefault(NumberParam, 1),
    courseName: StringParam,
  });
  const { current, courseName } = query;
  const history = useHistory();
  const { data = { courses: [] }, refetch } = useQuery(
    "getCourses",
    async () => {
      const { data } = await axios.get(CONCAT_SERVER_URL("/courses"), {
        params: { current, courseName, max: MAX_TABLE_NUM },
      });
      return data;
    },
    {
      onSuccess: (data) => {
        setTotal(data.total);
      },
    }
  );

  useEffect(() => {
    if (current || courseName) refetch();
  }, [current, courseName]);
  const grade_name = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "F"];
  // acc:{
  //   grade:{

  //   },
  //   start,
  //   gradeIndex,
  // }
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

  const displayStatus = (payload) => {
    if (payload.msg) {
      const { type, msg } = payload;
      const content = { content: msg, duration: 1.5 };
      switch (type) {
        case "success":
          message.success(content);
          break;
        case "error":
        default:
          message.error(content);
          break;
      }
    }
  };

  return (
    <div className="Search">
      <div className="Search-title">
        <h1>歷年課程資料查詢</h1>{" "}
      </div>
      <div className="Search-bar">
        <SearchBar
          handleSearch={(courseName) =>
            setQuery((pre) => ({ ...pre, courseName }))
          }
          userInfo={userInfo}
          setModalShow={setModalShow}
        />
      </div>

      <>
        <SearchTable
          data={userInfo ? data.courses : []}
          selected={selected}
          setSelected={setSelected}
          setModalVisible={setModalVisible}
          displayStatus={displayStatus}
          current={current}
          total={userInfo ? total : 1}
          onPagechange={(current) => setQuery((pre) => ({ ...pre, current }))}
          max={MAX_TABLE_NUM}
        />
        <Modal
          title="Basic Modal"
          visible={true}
          onOk={() => {
            // setShowResult(true);
            setModalVisible(false);
            const ids = JSON.stringify(selected.map((item) => item["_id"]));
            history.push(`/chart/${ids}`);
          }}
          okText="查看結果"
          okButtonProps={selected.length > 0 ? {} : { disabled: true }}
          onCancel={() => setModalVisible(false)}
          cancelText="繼續選擇"
          visible={modalVisible}
        >
          <SelectedTable selected={selected} setSelected={setSelected} />
        </Modal>
      </>
    </div>
  );
};

export default SearchCourse;
