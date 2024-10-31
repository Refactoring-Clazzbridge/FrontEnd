import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Cookies from "js-cookie";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import Stack from "@mui/material/Stack";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { GitHub } from "@mui/icons-material";
import { UserContext } from "../../context/UserContext";
import apiClient from "../../shared/apiClient"; // default로 가져오기

const drawerWidth = 240;
const closedDrawerWidth = 64; // 슬라이드바가 닫혔을 때의 넓이

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(!open && {
    marginLeft: closedDrawerWidth,
    width: `calc(100% - ${closedDrawerWidth}px)`,
  }),
}));

const CustomIconButton = styled(IconButton)({
  borderRadius: "8px",
  color: "#59636E",
  border: "1px solid #D1D9E0",
});

const CustomBadge = styled(Badge)({
  "& .MuiBadge-standard": {
    top: "-7px", // 위치 조정
  },
});

const TopBar = ({ open }) => {
  const { userInfo } = useContext(UserContext);
  if (!userInfo == null) {
    console.log(userInfo.member.name);
  }
  const navigate = useNavigate();
  const location = useLocation();

  const getTitle = (pathname) => {
    switch (pathname) {
      case "/":
        return "대시보드";
      case "/about":
        return "About";
      case "/board":
        return "게시판";
      case "/freeboard":
        return "자유게시판";
      case "/noticeboard":
        return "공지사항";
      case "/profile":
        return "마이페이지";
      case "/chat":
        return "채팅";
      case "/lectureroom":
        return "강의실";
      case "/calendar":
        return "캘린더";
      case "/assignment":
        return "과제";
      case "/qna":
        return "질의응답";
      case "/vote":
        return "투표";
      case "/privatechat":
        return "1:1 채팅";
      case "/allchat":
        return "전체 채팅";
      case "/memberManager":
        return "회원 관리";

      default:
        return "Clazz";
    }
  };

  const LightTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: "rgba(0, 0, 0, 0.87)",
      boxShadow: theme.shadows[1],
      fontSize: 11,
    },
  }));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [isNotificationOpen, setNotificationOpen] = useState(false);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
    navigate("");
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleGitHubClick = () => {
    localStorage.getItem("userInfo");
    const githubUrl = userInfo.member.gitUrl; // 유저 데이터에서 깃허브 URL 가져오기
    // window.open(githubUrl, "_blank");
    console.log(githubUrl);
    window.open(githubUrl);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/PasswordCheck");
  };

  const handleLogoutClick = async () => {
    if (!userInfo || !userInfo.member || !userInfo.member.id) {
      console.error("Member ID is missing or invalid.");
      return;
    }

    const memberId = userInfo.member.id.toString(); // Long 타입의 고유 ID를 String으로 변환

    // 좌석 상태를 오프라인으로 업데이트하는 요청 보내기
    try {
      await apiClient.post("/logout", { memberId });
      console.log("좌석 상태를 오프라인으로 업데이트 완료");
    } catch (error) {
      console.error("좌석 상태 업데이트 중 오류 발생:", error);
    }

    // 좌석 정보를 localStorage에서 삭제
    // localStorage.removeItem("userHasSeat");

    // 기존 로그아웃 프로세스 진행
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("membertype");
    localStorage.removeItem("userId");
    Cookies.remove("refreshToken");
    localStorage.removeItem("seatInfo");
    console.log("토큰 제거 완료", localStorage.getItem("token"));


    // 페이지를 새로 고치거나 로그인 화면으로 이동
    window.location.reload();
  };

  const handleNotificationClick = () => {
    setNotificationOpen(true); // 알림창 열기
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false); // 알림창 닫기
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      sx={{
        top: "48px",
      }}
    >
      <MenuItem onClick={handleProfileClick}>마이페이지</MenuItem>
      <MenuItem onClick={handleLogoutClick}>로그아웃</MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <ForumOutlinedIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge badgeContent={17} color="error">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>프로필수정</p>
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar
      position="fixed"
      open={open}
      sx={{
        boxShadow: "none",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Toolbar
        sx={{
          // backgroundColor: "#f6f8fa",
          backgroundColor: "white",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          color: "black",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ display: { xs: "none", sm: "block" }, fontWeight: 700 }}
        >
          {getTitle(location.pathname)}
        </Typography>

        <Box
          sx={{
            display: {
              xs: "none",
              md: "flex",
            },
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {/* 깃허브 */}
            <LightTooltip title="GitHub">
              <CustomIconButton onClick={handleGitHubClick}>
                <GitHub fontSize="small" />
              </CustomIconButton>
            </LightTooltip>

            <LightTooltip title="채팅">
              <CustomIconButton onClick={handleNotificationClick}>
                <CustomBadge badgeContent={4} color="error" max={9}>
                  <ForumOutlinedIcon fontSize="small" />
                </CustomBadge>
              </CustomIconButton>
            </LightTooltip>

            {/* 알림 */}
            <LightTooltip title="알림">
              <CustomIconButton onClick={handleNotificationClick}>
                <CustomBadge badgeContent={19} color="error" max={9}>
                  <NotificationsNoneOutlinedIcon fontSize="small" />
                </CustomBadge>
              </CustomIconButton>
            </LightTooltip>

            {/* 유저 */}
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ width: "40px", height: "40px" }}
            >
              <LightTooltip title="내 정보">
                <Avatar
                  src={userInfo.member.profileImageUrl}
                  sx={{ width: "40px", height: "40px", marginLeft: "8px" }}
                />
              </LightTooltip>
            </IconButton>
          </Stack>
        </Box>

        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            aria-label="show more"
            aria-controls={mobileMenuId}
            aria-haspopup="true"
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
      {renderMobileMenu}
      <Dialog open={isNotificationOpen} onClose={handleNotificationClose}>
        <DialogTitle>알림</DialogTitle>
        <DialogContent>
          <DialogContentText>업데이트 예정입니다.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNotificationClose}>닫기</Button>
        </DialogActions>
      </Dialog>
      {renderMenu}
    </AppBar>
  );
};

export default TopBar;
