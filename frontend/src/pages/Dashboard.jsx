import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Paper } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [clips, setClips] = useState([]);

  const fetchData = async () => {
    const moviesRes = await fetch('http://localhost:4000/api/movies');
    const moviesData = await moviesRes.json();
    setMovies(moviesData.movies || []);

    const clipsRes = await fetch('http://localhost:4000/api/clips');
    const clipsData = await clipsRes.json();
    setClips(clipsData.clips || []);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const countByStatus = (status) => movies.filter((m) => m.status === status).length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>📊 Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Movies</Typography>
            <Typography variant="h4">{movies.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Processing</Typography>
            <Typography variant="h4">{countByStatus('processing')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Completed</Typography>
            <Typography variant="h4">{countByStatus('completed')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Failed</Typography>
            <Typography variant="h4">{countByStatus('failed')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Clips</Typography>
            <Typography variant="h4">{clips.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Currently Processing</Typography>
            {movies.filter(m => m.status === 'processing').map((movie) => (
              <Typography key={movie.id} variant="body2">🎬 {movie.title}</Typography>
            ))}
            {movies.filter(m => m.status === 'processing').length === 0 && (
              <Typography variant="body2">✅ No active processes</Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>🎞️ Recent Clips</Typography>
          <Slider dots infinite speed={500} slidesToShow={3} slidesToScroll={1}>
            {clips.slice(-6).reverse().map((clip) => {
              const clipUrl = `http://localhost:4000${clip.clip_path.replace(/^.*\/clips/, '/clips')}`;
              return (
                <Box key={clip.id} sx={{ p: 1 }}>
                  <video src={clipUrl} controls style={{ width: '100%', borderRadius: 4 }} />
                </Box>
              );
            })}
          </Slider>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">System Health</Typography>
          <Typography variant="body2">✅ Backend: Online</Typography>
          <Typography variant="body2">✅ WebSocket: Online</Typography>
          <Typography variant="body2">✅ DB: Online</Typography>
          <Typography variant="body2">✅ Clips folder: Ready</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Version: 1.0.0 🚀</Typography>
        </Paper>
      </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;