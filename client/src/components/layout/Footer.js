import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <footer sx={{ mt: 4, pt: 3 }}>
      <Container>
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          {new Date().getFullYear()}
          {' '}
          <span>EduMart</span>{' '}
          All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Learning Materials Marketplace
        </Typography>
      </Container>
    </footer>
  );
};

export default Footer;