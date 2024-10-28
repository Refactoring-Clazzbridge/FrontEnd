import * as React from 'react';
import { useState } from 'react';
import { Modal, Box, Button, IconButton, Typography, Select, MenuItem } from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import axios from 'axios';

export default function CreateChatButton({ existingChats, userId }) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);

  const handleOpen = async () => {
    setOpen(true);
    // Fetch available users excluding the current user's chat partners
    const response = await axios.get('http://localhost:3001/api/available-users', {
      params: { userId }
    });
    setAvailableUsers(response.data);
  };

  const handleClose = () => setOpen(false);

  const handleCreateChat = async () => {
    if (!selectedUser) return;

    // Create a new chat request
    try {
      const response = await axios.post('http://localhost:3001/api/create-chat', {
        participants: [userId, selectedUser]
      });

      if (response.status === 200) {
        alert('New chat created successfully!');
        handleClose();
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('Failed to create chat.');
    }
  };

  return (
      <>
        <IconButton
            variant="plain"
            aria-label="edit"
            color="neutral"
            size="sm"
            sx={{ display: { xs: 'none', sm: 'unset' } }}
            onClick={handleOpen}
        >
          <EditNoteRoundedIcon />
        </IconButton>

        {/* Modal for Creating a New Chat */}
        <Modal open={open} onClose={handleClose}>
          <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
              }}
          >
            <Typography variant="h6" component="h2">
              Create New Chat
            </Typography>
            <Select
                fullWidth
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                displayEmpty
                sx={{ mt: 2 }}
            >
              <MenuItem value="" disabled>
                Select a user
              </MenuItem>
              {availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
              ))}
            </Select>
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" onClick={handleCreateChat} fullWidth>
                Create Chat
              </Button>
            </Box>
          </Box>
        </Modal>
      </>
  );
}