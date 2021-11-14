import React, { useState, useEffect } from "react";
// import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
// import { useDispatch } from "react-redux";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import axios from "axios";
// import { setVerified, setId } from "../redux/userSlice";
import Loading from "../component/Loading";
// import { setCookie } from "../cookieHelper";
import { CONCAT_SERVER_URL } from "../utils";
import { tidyUpData } from "../component/Data";

const config = {
  headers: {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
};

const useStyles = makeStyles((theme) => ({
  root: {
    '"& > *"': {
      margin: theme.spacing(1),
      width: '"25ch"',
    },
  },
  centerMargin: {
    margin: "0px auto 0px",
  },
  controlSpace: {
    marginTop: "10px",
    width: "300px",
    [`@media (max-width: 400px)`]: {
      width: "80%",
    },
  },
  controlButton: {
    marginTop: "30px",
    width: "200px",
    [`@media (max-width: 400px)`]: {
      width: "170px",
    },
  },
  visitorHref: {
    display: "block",
    marginTop: "80px",
    color: "gray",
  },
}));

export default function LoginFormInfo({ setUserInfo, onHide }) {
  const classes = useStyles();
  // const history = useHistory();
  // const dispatch = useDispatch();
  const [info, setInfo] = useState({
    email: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState(false);

  const [state, setState] = useState({
    isError: false,
    nowLoading: false,
    errorMes: ["", ""],
  });

  const handleChangeEmail = (e) => {
    setInfo({
      ...info,
      email: e.target.value,
    });
  };

  const handleChangePassword = (e) => {
    setInfo({
      ...info,
      password: e.target.value,
    });
  };

  useEffect(() => {
    if (isLogin) {
      setUserInfo({ account: info.email, password: info.password });
      onHide();
    }
  }, [isLogin]);

  const handleSubmit = () => {
    setState({
      isError: state.isError,
      nowLoading: true,
      errorMes: state.errorMes,
    });
    axios
      .post(
        CONCAT_SERVER_URL("/login"),
        { account: info.email, password: info.password },
        config
      )
      .then((response) => {
        if (response.data === "login success") {
          setState({
            isError: false,
            nowLoading: true,
            errorMes: "",
          });
          setIsLogin(true);
          // const currentPath = history.location.pathname;
        } else {
          setState({
            isError: true,
            nowLoading: false,
            errorMes: ["", response.data],
          });
        }
      })
      .catch((error) => {
        if (error === null) return;
        setState({
          isError: true,
          nowLoading: false,
          errorMes: ["", "Connection fail"],
        });
      });
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className={classes.centerMargin}>
      <form className={classes.root} noValidate autoComplete="off">
        <TextField
          value={info.email}
          label="帳號"
          variant="outlined"
          required
          error={state.isError}
          helperText={state.errorMes[0]}
          placeholder="enter your email"
          color="primary"
          className={classes.controlSpace}
          InputProps={{ style: { borderRadius: "50px" } }}
          onChange={handleChangeEmail}
        />

        <TextField
          type="password"
          value={info.password}
          label="密碼"
          variant="outlined"
          required
          error={state.isError}
          helperText={state.errorMes[1]}
          placeholder="enter your password"
          color="primary"
          className={classes.controlSpace}
          InputProps={{ style: { borderRadius: "50px" } }}
          onChange={handleChangePassword}
          onKeyUp={handleSearch}
        />

        {state.nowLoading ? (
          <Loading />
        ) : (
          <Button
            variant="contained"
            component="span"
            className={classes.controlButton}
            onClick={handleSubmit}
          >
            登入
          </Button>
        )}
      </form>
    </div>
  );
}
