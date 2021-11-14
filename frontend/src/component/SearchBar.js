import { Input, Space } from "antd";
import { useState } from "react";
const { Search } = Input;

const SearchBar = ({ handleSearch, userInfo, setModalShow }) => {
  // const [loading, setLoading] = useState(false);

  const onSearch = (msg) => {
    // setLoading(true);
    if (!msg) {
      handleSearch(undefined);
      return;
    }
    handleSearch(msg);
  };

  const notLoginYet = () => {
    setModalShow(true);
  };

  return (
    <Search
      placeholder="請輸入關鍵字以搜尋"
      size="large"
      onSearch={userInfo === null ? notLoginYet : onSearch}
      enterButton
      // loading={loading}
    />
  );
};

export default SearchBar;
