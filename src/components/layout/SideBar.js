import React, { useEffect } from "react";
import { styled } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import TvOutlinedIcon from "@mui/icons-material/TvOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ModeCommentOutlinedIcon from "@mui/icons-material/ModeCommentOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EventSeatOutlinedIcon from "@mui/icons-material/EventSeatOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import { useState } from "react";

export const drawerWidth = 240;
const closedDrawerWidth = 64;
const topBarHeight = 64; // 탑바의 높이 설정

const SideBar = ({ open, handleDrawerToggle }) => {
  const location = useLocation();
  const [type, setType] = useState(""); // role 상태 추가

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const role = localStorage.getItem("membertype");
        setType(role);
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchRole();
  }, []);

  const menuItems = [
    {
      title: "홈",
      icon: <HomeOutlinedIcon />,
      link: "/",
    },
    {
      title: "캘린더",
      icon: <CalendarMonthOutlinedIcon />,
      link: "/calendar",
    },
    {
      title: "게시판",
      icon: <AssignmentOutlinedIcon />,
      link: "/board",
      subItems: [
        // 관리자가 아닐 경우에만 하위 항목 추가
        ...(type !== "ROLE_ADMIN"
          ? [
              {
                title: "자유게시판",
                notifications: 2,
                icon: <AssignmentOutlinedIcon />,
                link: "/freeboard",
              },
              {
                title: "공지사항",
                notifications: 5,
                icon: <CampaignOutlinedIcon />,
                link: "/noticeboard",
              },
            ]
          : []),
      ],
    },
    {
      title: "강의실",
      icon: <TvOutlinedIcon />,
      link: "/lectureroom",
      subItems: [
        {
          title: "과제",
          notifications: 3,
          icon: <CreateOutlinedIcon />,
          link: "/assignment",
        },
        {
          title: "질의응답",
          notifications: 3,
          icon: <ContactSupportOutlinedIcon />,
          link: "/qna",
        },
        {
          title: "투표",
          notifications: 3,
          icon: <PollOutlinedIcon />,
          link: "/vote",
        },
      ],
    },
    {
      title: "채팅",
      icon: <ModeCommentOutlinedIcon />,
      link: "/chat",
      subItems: [
        {
          title: "전체채팅",
          notifications: 1,
          icon: <ModeCommentOutlinedIcon />,
          link: "/allchat",
        },
        {
          title: "1:1 채팅",
          notifications: 4,
          icon: <ForumOutlinedIcon />,
          link: "/privatechat",
        },
      ],
    },
  ];

  // ROLE_ADMIN일 경우 관리 메뉴 추가
  // ROLE_ADMIN일 경우에만 관리 메뉴 추가, type이 undefined가 아닌 경우만 확인
  if (type && type === "ROLE_ADMIN") {
    menuItems.push({
      title: "관리",
      icon: <AccountTreeOutlinedIcon />,
      subItems: [
        {
          title: "회원관리",
          notifications: 4,
          icon: <PeopleAltOutlinedIcon />,
          link: "/memberManager",
        },
        {
          title: "강의관리",
          notifications: 4,
          icon: <SchoolOutlinedIcon />,
          link: "/courseManager",
        },
        {
          title: "강의실관리",
          notifications: 4,
          icon: <EventSeatOutlinedIcon />,
          link: "/classroomManager",
        },
      ],
    });
  }

  const StyledListItemButton = styled(ListItemButton)({
    "&.Mui-selected": {
      backgroundColor: "#f6f8fa",

      "&:hover": {
        backgroundColor: "#f6f8fa",
      },
    },
    "&.Mui-selected .MuiTypography-root": {
      fontWeight: "600",
      color: "black",
    },
  });

  const StyledListItemText = styled(ListItemText)({
    "& .MuiTypography-root": {
      fontWeight: "600",
      fontSize: "12px",
      color: "gray",
    },
  });

  const StyledListMainItemText = styled(ListItemText)({
    "& .MuiTypography-root": {
      color: "gray",
      fontSize: "12px",
      fontWeight: "600",
    },
  });

  const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    height: "100%", // 탑바 높이만큼 높이 조정 제거
  });

  const closedMixin = (theme) => ({
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: closedDrawerWidth,
    height: "100vh", // 전체 높이로 설정
    borderRight: "1px solid rgba(0, 0, 0, 0.12)", // 오른쪽 경
  });

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  }));

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    position: "fixed", // 고정 위치
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  }));

  const MenuButtonContainer = styled(Box)(({ theme }) => ({
    position: "fixed",
    left: 0,
    top: 0,
    width: closedDrawerWidth, // 슬라이드바의 넓이와 맞춤
    height: topBarHeight, // 탑바 높이와 맞춤
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: theme.zIndex.drawer + 2,
    margin: "auto", // 가운데 정렬
  }));

  return (
    <Box sx={{ display: "flex" }}>
      <MenuButtonContainer>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{ margin: "auto" }}
        >
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </MenuButtonContainer>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader />
        <List sx={{ padding: "0px" }}>
          {menuItems.map((text, index) => (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <StyledListItemButton
                selected={location.pathname === text.link}
                component={Link}
                to={text.link}
                sx={[
                  {
                    minHeight: 48,
                    px: 2.5,
                  },
                  open
                    ? {
                        justifyContent: "initial",
                      }
                    : {
                        justifyContent: "center",
                      },
                ]}
              >
                <ListItemIcon
                  sx={[
                    {
                      minWidth: 0,
                      justifyContent: "center",
                    },
                    open
                      ? {
                          mr: 3,
                          display: "none",
                        }
                      : {
                          mr: "auto",
                        },
                  ]}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: "20px",

                      margin: "0px",
                    }}
                  >
                    {text.icon}
                    <Typography
                      sx={{
                        width: "24px",
                        fontSize: "10px",
                        marginTop: "2px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      {text.title}
                    </Typography>
                  </Box>
                </ListItemIcon>
                <StyledListMainItemText
                  primary={text.title}
                  style={{
                    display: open ? "block" : "none",
                  }}
                  sx={[
                    open
                      ? {
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                        },
                  ]}
                />
              </StyledListItemButton>

              {text.subItems &&
                text.subItems.map((subItem, subIndex) => (
                  <StyledListItemButton
                    selected={location.pathname === subItem.link}
                    key={subIndex}
                    style={{
                      minHeight: 48,
                      px: 2.5,
                      justifyContent: "space-between",
                      padding: "0px 18px 0px 18px ",
                      height: "40px",
                      display: open ? "flex" : "none",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    component={Link}
                    to={subItem.link}
                  >
                    <ListItemIcon
                      style={{ width: "50px", display: "flex" }}
                      sx={[open ? { display: "block" } : { display: "none" }]}
                    >
                      {subItem.icon}
                    </ListItemIcon>

                    <StyledListItemText
                      primary={subItem.title}
                      style={{ width: "50px" }}
                      sx={[
                        open
                          ? {
                              display: "flex",
                              marginLeft: "-10px",
                              marginTop: 0,
                              marginBottom: 0,
                            }
                          : {
                              display: "none",
                            },
                      ]}
                    />
                  </StyledListItemButton>
                ))}
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default SideBar;
