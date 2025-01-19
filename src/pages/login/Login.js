import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Router from "../../shared/Router";
import {useLogin} from "../../context/LoginContext";
import {CustomLoginForm} from "./CustomLoginForm";

function Login() {
  const {isLoggedIn} = useLogin();

  return (
    <Box>
      {isLoggedIn ? (
          <Router />
      ) : (
          <CustomLoginForm />
      )}
    </Box>
  );
}

export default Login;
