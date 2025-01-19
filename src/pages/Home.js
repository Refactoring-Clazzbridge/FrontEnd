import React, { useState, useEffect } from "react"; // React를 중괄호 없이 가져옴
import apiClient from '../shared/apiClient';
import './CharacterProgress.css'; // 스타일을 위한 CSS 파일
import axios from 'axios';
import Calendars from "./calendar/Calendars";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
} from "@mui/material";

const Home = () => {
    // role 상태
    const [role, setType] = useState("");
    const [name, setName] = useState("");
    // course 상태
    const [course, setCourse] = useState("");
    const [courseSize, setCourseSize] = useState("");
    const [totalDate, setTotalDate] = useState("");
    const [elapsedDate, setElapsedDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [enddate, setEndDate] = useState("");
    const [restdate, setRestDate] = useState("");
    const progressPercentage = elapsedDate / totalDate * 100;


    const getWeatherDescriptionInKorean = (description) => {
        const descriptions = {
            Clear: "맑음",
            Clouds: "구름 많음",
            Rain: "비",
            Snow: "눈",
            Drizzle: "이슬비",
            Thunderstorm: "천둥번개",
            Mist: "안개",
            Smoke: "연기",
            Haze: "흐림",
            Dust: "먼지",
            Fog: "안개",
            Sand: "모래",
            Ash: "재",
            Squall: "돌풍",
            Tornado: "토네이도"
        };

        return descriptions[description] || description; // 기본값으로 영어 설명 반환
    };

    // Timer

    const [weather, setWeather] = useState(null);

    const API_KEY = '67469ac1032528c1feebbdf683151284'; // OpenWeatherMap API 키


    const fetchWeather = async (lat, lon) => {
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
            );

            setWeather(response.data);
        } catch (err) {
            setWeather(null);
        } finally {
        }
    };

    const getLocationAndFetchWeather = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                },
                () => {
                    // 위치 접근이 거부된 경우 기본 위치로 서울 좌표 설정
                    fetchWeather(37.5665, 126.9780); // 서울 좌표
                }
            );
        } else {
            // 브라우저가 위치 정보를 지원하지 않는 경우
            fetchWeather(37.5665, 126.9780); // 서울 좌표
        }
    };

    useEffect(() => {
        getLocationAndFetchWeather();
    }, []);

    useEffect(() => {
        // 페이지가 처음 로드될 때 API에서 데이터를 가져옵니다.
        const fetchRole = async () => {
            try {
                const token = localStorage.getItem('token'); // localStorage에서 token 가져오기
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));

                if (!token) {
                    console.log('No token found in localStorage');
                    return;
                }

                // API 요청 보내기
                const role = userInfo.member.role;
                setName(userInfo.member.name);

                if (role !== "ROLE_ADMIN" && userInfo) {
                    const response = await apiClient.get(`user/check/${userInfo.member.id}`);
                    setCourse(response.data); // 강의 목록 설정
                    if (localStorage.getItem('membertype') !== "ROLE_ADMIN") {
                        const encodedCourse = encodeURIComponent(response.data);
                        const response2 = await apiClient.get(`/course/time/${encodedCourse}`);
                        setElapsedDate(response2.data[0]);
                        setTotalDate(response2.data[1]);
                        setStartDate(response2.data[2]);
                        setEndDate(response2.data[3]);
                        setRestDate(response2.data[4]);
                        setCourseSize(response2.data[5]);
                        console.log(response2.data);
                    }
                }
                setType(role); // 받은 role을 상태로 저장
            } catch (error) {
                console.error('Error fetching role:', error);
            }
        };
        fetchRole();
    }, []); // 빈 배열로 처음에 한 번만 실행

    return (

        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                height: "90%",
            }}
        >

            <Grid container spacing={3} justifyContent="center">
                {/* 이름 */}
                <Grid item xs={12} md={6} lg={8} marginRight='50px'>
                    <Paper
                        elevation={3}
                        sx={{
                            padding: "72px",
                            borderRadius: "20px",
                            textAlign: "center",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                            marginBottom: '20px',
                        }}
                    >
                        <Typography variant="h2" sx={{ fontWeight: 650, color: "#007aff" }}>
                            {name} 님 환영합니다!
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={3} md={3} lg={2.6}> 
                <Paper
                    elevation={3}
                    sx={{
                        padding: "20px",
                        borderRadius: "20px",
                        textAlign: "center",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                        marginBottom: '20px',
                    }}
                >
                    {weather && (
                        <Grid>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
                                {(weather.name)}{/* 시 이름만 표시 */}
                            </Typography>

                            <Grid
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {/* 날씨 아이콘 */}
                                <Grid sx={{ marginRight: "10px" }}>
                                    {weather.weather[0].main === "Clear" && (
                                        <img src="/icons/sun.png" alt="Clear" width="50" />
                                    )}
                                    {weather.weather[0].main === "Clouds" && (
                                        <img src="/icons/cloud.png" alt="Cloudy" width="50" />
                                    )}
                                    {weather.weather[0].main === "Rain" && (
                                        <img src="/icons/rain.png" alt="Rain" width="50" />
                                    )}
                                    {weather.weather[0].main === "Snow" && (
                                        <img src="/icons/snow.png" alt="Snow" width="50" />
                                    )}
                                    {/* 추가 상태들 */}
                                </Grid>

                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#007aff",
                                        fontSize: "2.5rem",
                                        marginRight: "10px",
                                    }}
                                >
                                    {weather.main.temp.toFixed(1)}°C
                                </Typography>
                            </Grid>

                            <Typography
                                variant="body1"
                                sx={{ fontSize: "1.2rem", color: "#555", marginTop: "5px" }}
                            >
                                {getWeatherDescriptionInKorean(weather.weather[0].main)} {/* 한글 날씨 상태 변환*/}
                            </Typography>

                            {/* 날씨 업데이트 버튼 */}
                            <Button
                                variant="outlined"
                                onClick={getLocationAndFetchWeather}
                                sx={{ marginTop: "15px" }}
                            >
                                현재 위치로 날씨 업데이트
                            </Button>
                        </Grid>
                    )}
                    </Paper>
                </Grid>
            </Grid>
            <Grid container spacing={3} justifyContent="center">
                {/* 학원 일정 카드 */}
                <Grid item xs={12} md={6} lg={3} sx={{ height:500 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            padding: "30px",
                            borderRadius: "20px",
                            textAlign: "center",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                            marginBottom: "38px",
                        }}
                    >

                        {/* 내부 Grid 컨테이너 - 세로 방향 */}
                        <Grid container direction="column" spacing={2} justifyContent="center">
                            <Grid
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <div className="character-progress-container">
                                    {role === "ROLE_ADMIN" ?
                                        <div className="course-label">관리자 계정입니다.{course}</div>
                                        :
                                        <div className="course-label"><b>과정명 : {course}</b> </div>
                                    }
                                    <div className="progress-bar-container">
                                        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                    <br />
                                    <img src="/icons/main.jpg" alt="Main" width="50%" />

                                    {role === "ROLE_ADMIN" ?
                                        <div> 괸리자</div>
                                        :
                                        <div className="progress-label">
                                            <div className="member-label" style={{ display: 'flex', justifyContent: 'center' }} >{name}</div>
                                            <div className="start-label" style={{ display: 'flex', justifyContent: 'center' }}>시작 날짜 : {startDate}</div>
                                            <div className="end-label" style={{ display: 'flex', justifyContent: 'center' }}>종료 날짜 : {enddate}</div>
                                            <div className="check-label" style={{ display: 'flex', justifyContent: 'center' }}>경과 일수 : {elapsedDate} 일</div>
                                            <div className="rest-label" style={{ display: 'flex', justifyContent: 'center' }}>남은 일수 : {restdate} 일</div>
                                        </div>
                                    }
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* 총 수강생 인원 카드 수정 */}
                    <Paper
                        elevation={3}
                        sx={{
                            padding: "20px",
                            borderRadius: "20px",
                            textAlign: "center",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <Grid item xs={12} md={6} lg={12} alignItems="center">
                            <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
                                총 수강생 인원
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 700, color: "#007aff" }}>
                                {courseSize}명
                            </Typography>

                        </Grid>
                    </Paper>
                </Grid>

                {/* 달력 */}
                <Grid item xs={12} md={6} lg={8} sx={{height:600} }>
                    <Paper
                        elevation={3}
                        sx={{
                            width: "100%",
                            height: "100%", // 높이 조정
                            padding: "20px",
                            borderRadius: "20px",
                            textAlign: "center",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",

                        }}
                    >
                        <div style={{
                            display: 'flex', // flexbox로 설정
                            flexDirection: 'column', // 세로 방향으로 배치
                            justifyContent: 'flex-start', // 상단 정렬
                            transform: 'scale(1.0, 1.0)',
                            height: '100%', // div의 높이를 100%로 설정
                        }}>
                            <Calendars readOnly={true} />
                        </div>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
export default Home;