import React from 'react';
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import StatusBar from './StatusBar';
import LinearProgress from '@mui/material/LinearProgress';
import { useState, useEffect } from 'react';

const drawerWidth = 220;

function Layout({ children }) {
  const location = useLocation();

  const menuItems = ['Dashboard', 'Movies', 'Clips', 'Scenes', 'Status'];

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    window.addEventListener('fetch-start', handleStart);
    window.addEventListener('fetch-stop', handleStop);

    return () => {
      window.removeEventListener('fetch-start', handleStart);
      window.removeEventListener('fetch-stop', handleStop);
    };
  }, []);

  

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            🎬 Movie Clipper Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {loading && <LinearProgress sx={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 1202 }} />}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'background.default' },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((text) => {
            const to = text === 'Dashboard' ? '/dashboard' :
                       text === 'Movies' ? '/' : `/${text.toLowerCase()}`;
            const selected = location.pathname === to;

            return (
              <ListItem
                button
                key={text}
                component={Link}
                to={to}
                sx={{
                  bgcolor: selected ? 'primary.main' : 'transparent',
                  color: selected ? '#fff' : 'text.primary',
                  '&:hover': { bgcolor: 'primary.light', color: '#fff' },
                }}
              >
                <ListItemText primary={text} />
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
        <StatusBar />
      </Box>
    </Box>
  );
}

export default Layout;