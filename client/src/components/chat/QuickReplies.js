import React from 'react';
import { Box, Chip } from '@mui/material';

const QuickReplies = ({ quickReplies = [], onSelect }) => {
  if (!quickReplies || quickReplies.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
      {quickReplies.map((qr, idx) => (
        <Chip
          key={`${qr}-${idx}`}
          label={qr}
          size="small"
          color="primary"
          variant="outlined"
          clickable
          onClick={() => onSelect && onSelect(qr)}
          sx={{ fontSize: '0.75rem', bgcolor: 'white' }}
        />
      ))}
    </Box>
  );
};

export default QuickReplies;
