import "./TodoList.css";
import { useEffect, useState } from "react";
import EditableTable from "../component/EditableTable";
import { useHistory } from "react-router-dom";
import { Button } from "antd";
import axios from "axios";
import { CONCAT_SERVER_URL } from "../utils";
import { tidyUpData } from "../component/Data";

const config = {
  headers: {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
};

const TodoList = ({ userInfo, setModalShow }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const modifyTableData = (newData) => {
    setData(newData);
  };
  const onQuery = async () => {
    setIsLoading(true);
    await axios
      .post(CONCAT_SERVER_URL("/getTodos"), userInfo, config)
      .then((response) => {
        const rawData = tidyUpData(response.data && response.data.info);
        setData(rawData);
      })
      .catch((error) => {
        console.log(error);
      });
    setIsLoading(false);
  };
  return (
    <div className="Todo">
      {" "}
      <div className="Todo-title">
        <h1>我的作業死線</h1>{" "}
      </div>
      <div className="Todo-table">
        <EditableTable
          data={data}
          setData={modifyTableData}
          handleQuery={onQuery}
          userInfo={userInfo}
          setModalShow={setModalShow}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default TodoList;
