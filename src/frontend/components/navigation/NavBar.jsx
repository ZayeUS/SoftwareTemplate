import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Drawer,
  List, ListItem, ListItemText, useMediaQuery, useTheme,
  Box, Container, Divider, alpha
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Menu, Home, LogIn, ChevronRight, X, Zap } from 'lucide-react';

export const NavBar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNavigation = () => setOpenDrawer(false);

  const navItems = [
    { text: "Home", icon: <Home size={18} />, path: "/" },
    { text: "Features", icon: <Zap size={18} />, path: "/features" },
    { text: "Pricing", icon: <ChevronRight size={18} />, path: "/pricing" },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1 }}>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              mr: 4,
              textDecoration: 'none'
            }}
          >
            <Zap size={24} style={{ marginRight: 8 }} />
            SaaSify
          </Typography>

          {!isMobile && (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    color="inherit"
                    sx={{
                      fontWeight: 500,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      display: 'flex',
                      gap: 1
                    }}
                  >
                    {item.icon}
                    {item.text}
                  </Button>
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* --- THIS IS THE NEW LOGIN BUTTON --- */}
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                  sx={{
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    display: 'flex',
                    gap: 1
                  }}
                >
                  <LogIn size={18} />
                  Login
                </Button>

                <Button
                  component={Link}
                  to="/signup"
                  variant="contained"
                  color="secondary"
                  disableElevation
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </>
          )}

          {isMobile && (
            <Box sx={{ ml: 'auto' }}>
              {!isSmallMobile && (
                <Button
                  component={Link}
                  to="/login"
                  onClick={handleNavigation}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 500,
                    textTransform: 'none',
                    mr: 1
                  }}
                >
                  <LogIn size={16} style={{ marginRight: 4 }} />
                  Login
                </Button>
              )}
              <IconButton
                edge="end"
                color="inherit"
                onClick={() => setOpenDrawer(!openDrawer)}
                sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) } }}
              >
                <Menu size={24} />
              </IconButton>
            </Box>
          )}

          <Drawer
            anchor="right"
            open={openDrawer}
            onClose={() => setOpenDrawer(false)}
            PaperProps={{
              sx: {
                width: isSmallMobile ? '100%' : 280,
                p: 2,
                backgroundColor: theme.palette.background.paper,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                onClick={handleNavigation}
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Zap size={20} style={{ marginRight: 6 }} />
                SaaSify
              </Typography>
              <IconButton onClick={() => setOpenDrawer(false)} size="small">
                <X size={20} />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <List>
              {navItems.map((item) => (
                <ListItem
                  key={item.text}
                  component={Link}
                  to={item.path}
                  onClick={handleNavigation}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {item.icon}
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        fontSize: '1rem'
                      }}
                    />
                  </Box>
                </ListItem>
              ))}

              <Divider sx={{ my: 2 }} />
              
              {/* --- THIS IS THE NEW LOGIN BUTTON FOR MOBILE DRAWER --- */}
              <Button
                component={Link}
                to="/login"
                onClick={handleNavigation}
                fullWidth
                variant="outlined"
                color="primary"
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  textTransform: 'none',
                  mb: 2,
                  py: 1
                }}
              >
                <LogIn size={18} style={{ marginRight: 8 }} />
                Login
              </Button>

              <Button
                component={Link}
                to="/signup"
                onClick={handleNavigation}
                fullWidth
                variant="contained"
                color="primary"
                disableElevation
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 1,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                }}
              >
                Get Started
              </Button>
            </List>
          </Drawer>
        </Toolbar>
      </Container>
    </AppBar>
  );
};