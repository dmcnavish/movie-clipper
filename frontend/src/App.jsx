import React, { useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Movies from './pages/Movies';
import Clips from './pages/Clips';
import Scenes from './pages/Scenes';
import Status from './pages/Status';
import Dashboard from './pages/Dashboard';
import themeBase from './theme';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [mode, setMode] = useState('dark');

  const theme = useMemo(() =>
    ({
      ...themeBase,
      palette: {
        ...themeBase.palette,
        mode,
      }
    }), [mode]);

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent toggleMode={toggleMode} mode={mode} />
      </Router>
    </ThemeProvider>
  );
}

function AppContent({ toggleMode, mode }) {
  const location = useLocation();

  const PageWrapper = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );

  return (
    <Layout>
      <IconButton sx={{ position: 'fixed', top: 16, right: 16 }} onClick={toggleMode} color="inherit">
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Movies /></PageWrapper>} />
          <Route path="/clips" element={<PageWrapper><Clips /></PageWrapper>} />
          <Route path="/scenes" element={<PageWrapper><Scenes /></PageWrapper>} />
          <Route path="/status" element={<PageWrapper><Status /></PageWrapper>} />
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default App;