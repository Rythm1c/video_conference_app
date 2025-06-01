import React from 'react'
import { Box, Button, Typography, Grid, Chip, Tooltip } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';

const truncate = (str, len) => {
    return str.length > len ? str.slice(0, len) + '...' : str;
};

function RoomCard({ room, handleJoinClick }) {
    const displayName = truncate(room.name, 8);
    return (
        <Box sx={{
            width: '100%',
            minHeight: 180,
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            height: '100%',
            boxShadow: 1,
        }}>
            {room.name.length > 8 ? 
            <Tooltip title={room.name} arrow>
                <Typography variant="h7" noWrap>
                    {displayName}
                    </Typography>
            </Tooltip> : <Typography variant="h7" noWrap>{displayName}</Typography>}
            <Chip
                icon={room.is_private ? <LockIcon /> : <PublicIcon />}
                label={room.is_private ? 'Private' : 'Public'}
                color={room.is_private ? 'warning' : 'success'}
                variant="outlined"
                size="small"
            />
            {/* <Typography variant="body2" color="text.secondary">
                {room.members} active {room.members === 1 ? 'member' : 'members'}
            </Typography> */}
            <Box sx={{ mt: 'auto' }}>
                <Button fullWidth variant="contained" color="primary" onClick={() => handleJoinClick(room)}>Join</Button>
            </Box>

        </Box>
    )
}

export default RoomCard