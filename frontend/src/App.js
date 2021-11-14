import "./App.css";
import { useState, useEffect } from "react";

import SignUpPage from "./Login/SignUpPage";
import TodoList from "./container/TodoList";
import SearchCourse from "./container/SearchCourse";
import { Switch, Route } from "react-router-dom";
import LoginForm from "./Login/LoginForm";
import ChartPage from "./container/ChartPage";

import TopMenu from "./container/TopMenu";
function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  useEffect(() => {
    document.title = "NTU-Course-Widget";
  }, []);

  return (
    <div className="App">
      <TopMenu
        data={userInfo}
        onLogin={() => setModalShow(true)}
        onLogout={() => setUserInfo(null)}
      />
      <Switch>
        <Route exact path="/">
          <SignUpPage />
        </Route>
        <Route exact path="/todolist">
          <TodoList userInfo={userInfo} setModalShow={setModalShow} />
        </Route>
        <Route path="/search">
          <SearchCourse userInfo={userInfo} setModalShow={setModalShow} />
        </Route>
        <Route path="/chart/:ids">
          <ChartPage isLogin={userInfo !== null} />
        </Route>
      </Switch>
      <LoginForm
        backdrop={true}
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
        setUserInfo={setUserInfo}
        otherOption="取消"
      />
    </div>
  );
}

export default App;
