import React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import MyMessages from '../../components/chat/MyMessages';

export default function Chat() {
  return (
      <CssVarsProvider disableTransitionOnChange>
        <CssBaseline />
        <Box className="chatBox" sx={{ display: 'flex', minHeight: '100px', height: '10px' }}>
          <Box  component="main" className="MainContent" sx={{ flex: 1 }}>
            <MyMessages />
          </Box>
        </Box>
      </CssVarsProvider>
  );
}