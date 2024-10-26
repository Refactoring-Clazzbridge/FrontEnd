import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 추가
import {
    TextField,
    Button,
    Box,
    Typography,
    Container,
    CssBaseline,
    Alert
} from "@mui/material";
import apiClient from '../../shared/apiClient';


const PasswordCheck = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null); // userId 상태 추가
    const navigate = useNavigate(); // 추가
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (token) {
            try {
                const userId = userInfo.member.id; // userId 추출
                setUserId(userId);

                apiClient.get(`userlist/${userId}`)
                    .then(response => {

                    })
                    .catch(error => {
                        console.error('Error fetching profile', error);

                    });
            } catch (error) {
                console.error('Invalid token', error); // 잘못된 토큰 처리
            }
        }
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("userId : ", userId);

            // JWT 토큰을 localStorage에서 가져옵니다.
            const token = localStorage.getItem('token');

            // 서버에 비밀번호 확인 요청
            const response = await apiClient.post('userlist',
                { password, userId }, // 요청 본문
                {
                    headers: {
                        'Authorization': `Bearer ${token}` // Authorization 헤더에 토큰 추가
                    }
                }
            );

            if (response.data.success) {
                console.log(response.data.success);
                navigate('/profile'); // Profile.js로 이동
            } else {
                setError('비밀번호가 틀렸습니다.');
            }
        } catch (error) {
            console.error('비밀번호 확인 중 오류 발생:', error);
            setError('오류가 발생했습니다. 다시 시도해주세요.');
        }
    };


    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box sx={{ mt: 8 }}>
                <Typography component="h1" variant="h5">
                    비밀번호 확인
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="비밀번호"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"

                        sx={{ mt: 3 }}
                    >
                        확인
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default PasswordCheck;