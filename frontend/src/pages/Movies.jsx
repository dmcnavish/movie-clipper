import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Checkbox, FormControlLabel, Typography, Box, Slider, RadioGroup, FormControl, FormLabel, FormControlLabel as RadioControl, Radio, CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';

function Movies() {
  const [title, setTitle] = useState('');
  const [magnet, setMagnet] = useState('');
  const [skipChatgpt, setSkipChatgpt] = useState(false);
  const [scaleMode, setScaleMode] = useState('vertical');
  const [scaleValue, setScaleValue] = useState(720);
  const [maxScenes, setMaxScenes] = useState(4);
  const [movies, setMovies] = useState([]);

  const calculateScale = () => {
    if (scaleMode === 'horizontal') {
      const width = scaleValue;
      const height = Math.round(width * 9 / 16);
      return { width, height };
    } else {
      const height = scaleValue;
      const width = Math.round(height * 9 / 16);
      return { width, height };
    }
  };

  const handleSubmit = async () => {
    const { width, height } = calculateScale();

    const response = await fetch('http://localhost:4000/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        magnet,
        params: {
          skipChatgpt,
          scale: `${width}:${height}`,
          maxScenes
        }
      })
    });
    const data = await response.json();
    console.log(data);
    fetchMovies();
  };

  const fetchMovies = async () => {
    window.dispatchEvent(new Event('fetch-start'));
    const response = await fetch('http://localhost:4000/api/movies');
    const data = await response.json();
    setMovies(data.movies || []);
    window.dispatchEvent(new Event('fetch-stop'));
  };

  useEffect(() => {
    fetchMovies();
    const interval = setInterval(fetchMovies, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load settings on mount
    const saved = JSON.parse(localStorage.getItem('movieClipperSettings') || '{}');
    if (saved.scaleMode) setScaleMode(saved.scaleMode);
    if (saved.scaleValue) setScaleValue(saved.scaleValue);
    if (saved.maxScenes) setMaxScenes(saved.maxScenes);
  }, []);

  const { width, height } = calculateScale();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>🎬 Add New Movie</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        <TextField label="Movie Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField label="Magnet Link" value={magnet} onChange={(e) => setMagnet(e.target.value)} />
        <FormControlLabel
          control={<Checkbox checked={skipChatgpt} onChange={(e) => setSkipChatgpt(e.target.checked)} />}
          label="Skip ChatGPT"
        />

        <FormControl component="fieldset">
          <FormLabel component="legend">Scale Mode</FormLabel>
          <RadioGroup
            row
            value={scaleMode}
            onChange={(e) => setScaleMode(e.target.value)}
          >
            <RadioControl value="horizontal" control={<Radio />} label="Horizontal (16:9)" />
            <RadioControl value="vertical" control={<Radio />} label="Vertical (9:16)" />
          </RadioGroup>
        </FormControl>

        <Typography gutterBottom>
          {scaleMode === 'horizontal' ? `Width: ${width}px` : `Height: ${height}px`} → Final scale: {width}:{height}
        </Typography>
        <Slider
          value={scaleValue}
          onChange={(e, newValue) => setScaleValue(newValue)}
          step={scaleMode === 'horizontal' ? 160 : 120}
          min={scaleMode === 'horizontal' ? 640 : 360}
          max={scaleMode === 'horizontal' ? 1920 : 1080}
          valueLabelDisplay="auto"
        />

        <TextField
          label="Max Scenes"
          type="number"
          value={maxScenes}
          onChange={(e) => setMaxScenes(parseInt(e.target.value))}
          inputProps={{ min: 1, max: 10 }}
        />

        <Button variant="contained" onClick={handleSubmit}>Start Process</Button>
      </Box>

      <Typography variant="h5" gutterBottom>📋 Movie Queue</Typography>
      {movies.map((movie) => (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              mb: 2,
              p: 2,
              border: '1px solid #555',
              borderRadius: 1,
              bgcolor: movie.status === 'processing' ? 'warning.light' :
                       movie.status === 'completed' ? 'success.light' :
                       movie.status === 'failed' ? 'error.light' :
                       'background.paper',
              boxShadow: 1
            }}
          >
            <Typography variant="subtitle1">{movie.title}</Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Status: {movie.status}
              {movie.status === 'processing' && <CircularProgress size={16} />}
            </Typography>
          </Box>
        </motion.div>
      ))}
    </Box>
  );
}

export default Movies;