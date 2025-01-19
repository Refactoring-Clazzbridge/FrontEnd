import {createContext, useContext, useEffect, useState} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return !!localStorage.getItem("token") ? localStorage.getItem("token") : null;
  })
  const navigate = useNavigate();

  const updateToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  }

  const checkToken = async () => {
    const refreshToken = Cookies.get("refreshToken");

    if (token && isTokenValid()) {
      return true;
    } else if (refreshToken) {
      try {
        const response = await axios.post(
            "http://default-back-service-e27ef-100126159-b0eb9aec7a73.kr.lb.naverncp.com:8080/api/auth/refresh",
            {
              value: refreshToken,
            },
            {
              withCredentials: true,
            }
        );
        localStorage.setItem("token", response.data.accessToken);
        setToken(response.data.accessToken);
        return true;
      } catch (error) {
        console.error("Refresh token failed:", error);
        console.log("1=======> 로그인 페이지로");
        navigate("/"); // 로그인 페이지로 리다이렉트
        return false;
      }
    } else {
      console.log("2=======> 로그인 페이지로");
      navigate("/"); // 로그인 페이지로 리다이렉트
      return false;
    }
  };

  useEffect(() => {
    checkToken();
  }, [navigate]);

  const isTokenValid = () => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
          atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const { exp } = JSON.parse(jsonPayload);

      return exp > Date.now() / 1000;
    } catch (error) {
      console.error("Token is invalid:", error);
      return false;
    }
  };

  return (
    <TokenContext.Provider value={{ token, updateToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  return useContext(TokenContext);
}