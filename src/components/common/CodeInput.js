import { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs"; // 원다크 스타일 import
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript"; // 언어 구문 추가
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";
import cpp from "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
import html from "react-syntax-highlighter/dist/esm/languages/hljs/xml"; // xml로 불러와서 html 지원
import css from "react-syntax-highlighter/dist/esm/languages/hljs/css";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import typescript from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";

import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

// 하이라이팅을 지원하는 언어 목록
const supportedLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  // 필요한 언어 추가 가능
];

// SyntaxHighlighter에 사용할 언어 구문을 등록
SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("html", html);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("typescript", typescript);

export default function CodeInput() {
  const [inputValue, setInputValue] = useState("");
  const [isCode, setIsCode] = useState(false); // 코드 입력 모드 여부
  const [language, setLanguage] = useState("javascript"); // 기본 언어

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const toggleCodeMode = () => {
    setIsCode((prev) => !prev);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  // dracula 테마 수정
  const customDracula = {
    ...dracula,
    "hljs-keyword": { color: "#ff79c6", fontWeight: "bold" },
    "hljs-string": { color: "#50fa7b" },
    "hljs-number": { color: "#bd93f9" },
    "hljs-comment": { color: "#6272a4", fontStyle: "italic" },
    "hljs-function": { color: "#ffb86c" },
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          margin: "auto",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: "16px", fontWeight: 600 }}>
          {isCode ? "코드 모드" : "텍스트 모드"}
        </Typography>

        {/* 언어 선택 드롭다운 */}
        {isCode && (
          <FormControl fullWidth sx={{ marginBottom: "16px" }}>
            <InputLabel>언어 선택</InputLabel>
            <Select
              value={language}
              onChange={handleLanguageChange}
              label="언어 선택"
            >
              {supportedLanguages.map((lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* 입력 필드 */}
        <TextField
          label="코드를 입력하세요"
          multiline
          rows={isCode ? 10 : 6}
          fullWidth
          variant="outlined"
          value={inputValue}
          onChange={handleChange}
          sx={{
            fontFamily: isCode ? "monospace" : "Arial",
            fontSize: isCode ? "1rem" : "1.1rem",
            lineHeight: "1.5",
            borderRadius: "5px",
          }}
        />

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            sx={{
              backgroundColor: isCode ? "#34495e" : "#f6f8fa",
              color: isCode ? "" : "#34495e",
            }}
            onClick={toggleCodeMode}
          >
            {isCode ? "텍스트 모드로 전환" : "코드 모드로 전환"}
          </Button>
        </Box>

        {/* 코드 모드일 때 코드 하이라이팅 */}
        {isCode && (
          <Box
            mt={3}
            sx={{
              backgroundColor: "#282c34",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <SyntaxHighlighter language={language} style={customDracula}>
              {inputValue.trim() === ""
                ? `// ${language} 코드를 입력하세요.`
                : inputValue}
            </SyntaxHighlighter>
          </Box>
        )}
      </Box>
    </>
  );
}
