import React, { useState } from "react";
import "antd/dist/antd.css";
import {
  Table,
  Input,
  InputNumber,
  Popconfirm,
  Form,
  Typography,
  Modal,
  Button,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { utilGoogle } from "./util";

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode =
    inputType === "number" ? (
      <InputNumber />
    ) : (
      <Input placeholder={dataIndex === "due" ? "yyyy-mm-dd hh:mm" : ""} />
    );
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `請輸入 ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const makeCsv = (data) => {
  let csvData = "Subject,Description,Start date,Start Time,End Time\n";
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row.due === "" || row.hw === "" || row.course === "") return "";
    let newCsvData = row.hw + "," + row.course + ",";
    const tok = row.due.split(" ");
    const tokDate = tok[0].split("/"); // yyyy/mm/dd
    const tokTime = tok[1].split(":"); // hh:mm:ss
    newCsvData += tokDate[1] + "/" + tokDate[2] + "/" + tokDate[0] + ","; // mm/dd/yyyy
    const time =
      tokTime[0] > 12
        ? tokTime[0] - 12 + ":" + tokTime[1] + " PM"
        : tokTime[0] + ":" + tokTime[1] + " AM";
    newCsvData += time + "," + time + "\n";
    csvData += newCsvData;
  }
  return csvData;
};

const insertToCalendar = (data, success) => {
  const events = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    let event = {};
    if (row.due === "" || row.hw === "" || row.course === "") return false;
    event.summary = row.hw;
    event.description = row.course;
    const tok = row.due.split(" ");
    const tokDate = tok[0].split("/"); // yyyy/mm/dd
    event.start = {
      dateTime: tokDate.join("-") + "T" + tok[1] + ":00+08:00", // Taiwan time zone
    };
    event.end = {
      dateTime: tokDate.join("-") + "T" + tok[1] + ":00+08:00", // Taiwan time zone
    };
    events.push(event);
  }
  const { login } = utilGoogle();
  login(events, success, () => {});
  return true;
};

const EditableTable = ({
  data,
  setData,
  handleQuery,
  userInfo,
  setModalShow,
  isLoading,
}) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [selectedRowKeys, setSelectRowKeys] = useState([]);

  const isEditing = (record) => record.key === editingKey;

  const onSelectChange = (selectedRowKeys) => {
    setSelectRowKeys(selectedRowKeys);
  };

  const emptyWarning = () => {
    Modal.warning({
      title: "錯誤",
      content: "請檢查是否有欄位為空",
    });
  };

  const noDataWarning = () => {
    Modal.warning({
      title: "錯誤",
      content: "請選擇欲處理的資料",
    });
  };

  const exportSuccess = () => {
    Modal.success({
      title: "匯出成功",
      content: "可至 google 日曆匯入此檔案",
    });
  };

  const insertSuccess = () => {
    Modal.success({
      title: "已成功匯入至google 日曆",
    });
  };

  const { confirm } = Modal;

  const showConfirm = () => {
    confirm({
      title: "確定要刪除所選項目嗎？",
      icon: <ExclamationCircleOutlined />,
      okText: "確定",
      cancelText: "取消",
      onOk() {
        const newData = data.filter(
          (row) => !selectedRowKeys.includes(row.key)
        );
        setData(newData);
        setSelectRowKeys([]);
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      {
        key: "select_all",
        text: "全部選取",
        onSelect: () => {
          setSelectRowKeys(data.map((row) => row.key));
        },
      },
      {
        key: "select_none",
        text: "清除選取項目",
        onSelect: () => {
          setSelectRowKeys([]);
        },
      },
      {
        key: "delete",
        text: "刪除所選資料",
        onSelect: () => {
          showConfirm();
        },
      },
      {
        key: "export",
        text: "匯出成 csv 檔",
        onSelect: () => {
          if (selectedRowKeys.length === 0) {
            noDataWarning();
            return;
          }
          const selectedData = data.filter((row) =>
            selectedRowKeys.includes(row.key)
          );
          const csvData = makeCsv(selectedData);
          if (csvData) {
            exportSuccess();
            const blob = new Blob(["\uFEFF" + csvData], {
              type: "text/csv;charset=gb2312;",
            });
            const a = document.createElement("a");
            a.download = "todo.csv";
            a.href = URL.createObjectURL(blob);
            a.click();
          } else {
            emptyWarning();
          }
        },
      },
      {
        key: "insert",
        text: "匯入至 Google 日曆",
        onSelect: () => {
          if (selectedRowKeys.length === 0) {
            noDataWarning();
            return;
          }
          const selectedData = data.filter((row) =>
            selectedRowKeys.includes(row.key)
          );
          const res = insertToCalendar(selectedData, insertSuccess);
          if (!res) emptyWarning();
        },
      },
    ],
  };

  const edit = (record) => {
    form.setFieldsValue({
      course: "",
      hw: "",
      due: "",
      src_from: "",
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const deleteRow = (key) => {
    const newData = data.filter((row) => row.key !== key);
    setData(newData);
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "課程",
      dataIndex: "course",
      width: "33%",
      editable: true,
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a, b) => a.course.localeCompare(b.course),
    },
    {
      title: "作業",
      dataIndex: "hw",
      width: "33%",
      editable: true,
    },
    {
      title: "到期日",
      dataIndex: "due",
      width: "15%",
      editable: true,
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a, b) => a.due.localeCompare(b.due),
    },
    {
      title: "來源",
      dataIndex: "src_from",
      width: "6%",
      editable: false,
    },
    {
      title: "編輯",
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a
              href="javascript:;"
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              儲存
            </a>
            <Popconfirm
              title="確定要取消編輯嗎？"
              okText="確定"
              cancelText="取消"
              onConfirm={cancel}
            >
              <Typography.Link>取消</Typography.Link>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <div style={{ display: "inline-block", marginRight: "8px" }}>
              <Typography.Link
                disabled={editingKey !== ""}
                onClick={() => edit(record)}
              >
                修改
              </Typography.Link>
            </div>
            <div style={{ display: "inline-block" }}>
              <Popconfirm
                title="確定要刪除嗎？"
                okText="確定"
                cancelText="取消"
                onConfirm={() => deleteRow(record.key)}
              >
                <Typography.Link disabled={editingKey !== ""}>
                  刪除
                </Typography.Link>
              </Popconfirm>
            </div>
          </span>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === "Age" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const total = (data && data.length > 1) ? {} : {total: 1};

  return (
    <>
      <Form form={form} component={false}>
        <Table
          rowSelection={rowSelection}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          scroll={{ y: 550 }}
          pagination={{
            ...total,
            onChange: cancel,
            position: ["topRight"],
            showTotal: () => (
              <div className="Search-button_wrap">
                <Button
                  onClick={() =>
                    userInfo === null ? setModalShow(true) : handleQuery()
                  }
                  type="primary"
                  loading={isLoading}
                >
                  查看作業死線
                </Button>
              </div>
            ),
          }}
        />
      </Form>
    </>
  );
};

export default EditableTable;
