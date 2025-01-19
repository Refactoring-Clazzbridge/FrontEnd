import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 홈 페이지
import Home from "../pages/Home";

import Login from "../pages/login/Login";

// 게시판 페이지
import FreeBoard from "../pages/board/FreeBoard";
import NoticeBoard from "../pages/board/NoticeBoard";
import Board from "../pages/board/Board";

// 레이아웃 페이지
import LayoutWrapper from "../components/layout/layoutWrapper";

// 프로필 페이지
import Profile from "../pages/user/Profile";
import PasswordCheck from "../pages/user/PasswordCheck";

// 강의실 페이지
import LectureRoom from "../pages/lectureRoom/LectureRoom";
import Assignment from "../pages/lectureRoom/Assignment";
import Qna from "../pages/lectureRoom/Qna";
import Vote from "../pages/vote/Vote";

// 채팅 페이지
import Chat from "../pages/chat/MuiChat";
import Allchat from "../pages/chat/Allchat";
import Privatechat from "../pages/chat/Privatechat";

// 캘린더 페이지
import Calendar from "../pages/calendar/Calendars";
import QuestionList from "../pages/qna/QuestionListDataGrid";

// 유저관리
import MemberManager from "../pages/manager/MemberManager";
import ClassroomManager from "../pages/manager/ClassroomManager";
import CourseManager from "../pages/manager/CourseManager";

const Router = ({ isLoggedIn }) => {
  return (
    <Routes>
      <Route element={<LayoutWrapper />}>
        {/* 홈 */}
        <Route path="/" element={<Home />} />

        {/* 로그인 폼 */}
        <Route
          path="login"
          element={isLoggedIn ? <Navigate to="/" /> : <Login />} // 로그인 상태일 경우 홈으로 리다이렉트
        />

        {/* 게시판 */}
        <Route path="board" element={<Board />} />
        <Route path="freeboard" element={<FreeBoard />} />
        <Route path="noticeboard" element={<NoticeBoard />} />

        {/* 유저 관련 페이지 */}
        <Route path="profile" element={<Profile />} />
        <Route path="PasswordCheck" element={<PasswordCheck />} />

        {/* 강의실 페이지 */}
        <Route path="lectureroom" element={<LectureRoom />} />
        <Route path="assignment" element={<Assignment />} />
        <Route path="qna" element={<QuestionList />} />
        <Route path="vote" element={<Vote />} />

        {/* 채팅 페이지 */}
        <Route path="chat" element={<Chat />} />
        <Route path="allchat" element={<Allchat />} />
        <Route path="privatechat" element={<Privatechat />} />

        {/* 캘린더 */}
        <Route path="calendar" element={<Calendar />} />

        {/* 관리 */}
        <Route path="memberManager" element={<MemberManager />} />
        <Route path="classroomManager" element={<ClassroomManager />} />
        <Route path="courseManager" element={<CourseManager />} />

      </Route>
    </Routes>
  );
};

export default Router;
