const DetailTable = ({ course }) => {
  return (
    <table className="Result-table">
      <tbody>
        <tr>
          <td className="Result-td-header">年份</td>
          <td className="Result-td">{course.semester}</td>
        </tr>
        <tr>
          <td className="Result-td-header">課程名稱</td>
          <td className="Result-td">{course.class_name}</td>
        </tr>
        <tr>
          <td className="Result-td-header">授課教師</td>
          <td className="Result-td">{course.teacher_name}</td>
        </tr>
        <tr>
          <td className="Result-td-header">學分</td>
          <td className="Result-td">{course.credit}</td>
        </tr>
        <tr>
          <td className="Result-td-header">加選方式</td>
          <td className="Result-td">{course.reg_method}</td>
        </tr>
        <tr>
          <td className="Result-td-header">登記人數</td>
          <td className="Result-td">{course.reg_student_num}</td>
        </tr>
        <tr>
          <td className="Result-td-header">人數限制</td>
          <td className="Result-td">{course.limit_student_num}</td>
        </tr>
        <tr>
          <td className="Result-td-header">最終選上人數</td>
          <td className="Result-td">{course.study_student_num}</td>
        </tr>
        <tr>
          <td className="Result-td-header">流水號</td>
          <td className="Result-td">{course.id}</td>
        </tr>
        <tr>
          <td className="Result-td-header">課程識別碼</td>
          <td className="Result-td">{course.class_id}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default DetailTable;
