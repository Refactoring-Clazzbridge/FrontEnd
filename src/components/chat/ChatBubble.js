import React, { useState } from 'react';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';

export default function ChatBubble(props) {
  const { content, variant, timestamp, attachment = undefined, sender } = props;
  const isSent = variant === 'sent';
  const [isHovered, setIsHovered] = useState(false);


  return (
      <Box sx={{ maxWidth: '60%', minWidth: 'auto' }}>
        <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: 'space-between', mb: 0.25 }}
        >
          <Typography level="body-xs">
            {sender === 'You' ? sender : sender.name}
          </Typography>
          <Typography level="body-xs">
            {new Date(timestamp).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }).replace(/\./g, '.').replace(',', '')}
          </Typography>

        </Stack>
        {attachment ? (
            <Sheet
                variant="outlined"
                sx={[
                  {
                    px: 1.75,
                    py: 1.25,
                    borderRadius: 'lg',
                  },
                  isSent ? { borderTopRightRadius: 0 } : { borderTopRightRadius: 'lg' },
                  isSent ? { borderTopLeftRadius: 'lg' } : { borderTopLeftRadius: 0 },
                ]}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar color="primary" size="lg">
                  <InsertDriveFileRoundedIcon />
                </Avatar>
                <div>
                  <Typography sx={{ fontSize: 'sm' }}>{attachment.fileName}</Typography>
                  <Typography level="body-sm">{attachment.size}</Typography>
                </div>
              </Stack>
            </Sheet>
        ) : (
            <Box
                sx={{ position: 'relative' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
              <Sheet
                  color={isSent ? 'primary' : 'neutral'}
                  variant={isSent ? 'solid' : 'soft'}
                  sx={[
                    {
                      p: 1.25,
                      borderRadius: 'lg',
                    },
                    isSent
                        ? {
                          borderTopRightRadius: 0,
                        }
                        : {
                          borderTopRightRadius: 'lg',
                        },
                    isSent
                        ? {
                          borderTopLeftRadius: 'lg',
                        }
                        : {
                          borderTopLeftRadius: 0,
                        },
                    isSent
                        ? {
                          backgroundColor: 'var(--joy-palette-primary-solidBg)',
                        }
                        : {
                          backgroundColor: 'background.body',
                        },
                  ]}
              >
                <Typography
                    level="body-sm"
                    sx={[
                      isSent
                          ? {
                            color: 'var(--joy-palette-common-white)',
                          }
                          : {
                            color: 'var(--joy-palette-text-primary)',
                          },
                    ]}
                >
                  {content}
                </Typography>
              </Sheet>

            </Box>
        )}
      </Box>
  );
}