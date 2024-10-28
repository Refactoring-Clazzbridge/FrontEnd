import React, { useState } from 'react';
import { TextField, Button, List, ListItem, ListItemText, Box } from '@mui/material';

const ChatComponent = ({handleSubmit, messages}) => {
  const [inputValue, setInputValue] = useState('');

  return (
      <Box sx={{ p: 2 }}>
        <List sx={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: '#f0f0f0', borderRadius: '4px', mb: 2 }}>
          {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText primary={msg} />
              </ListItem>
          ))}
        </List>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
                label="Type a message"
                variant="outlined"
                fullWidth
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                sx={{ mr: 2 }}
            />
            <Button variant="contained" color="primary" type="submit">
              Send
            </Button>
          </Box>
        </form>
      </Box>
  );
};

export default ChatComponent;