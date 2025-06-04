import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Slider, RadioGroup, FormControl, FormLabel, FormControlLabel as RadioControl, Radio, TextField, Button
} from '@mui/material';

function Settings() {
  const [scaleMode, setScaleMode] = useState('vertical');
  const [scaleValue, setScaleValue] = useState(720);
  const [maxScenes, setMaxScenes] = useState(4);

  useEffect(() => {
    // Load from localStorage
    const saved = JSON.parse(localStorage.getItem('movieClipperSettings') || '{}');
    if (saved.scaleMode) setScaleMode(saved.scaleMode);
    if (saved.scaleValue) setScaleValue(saved.scaleValue);
    if (saved.maxScenes) setMaxScenes(saved.maxScenes);
  }, []);

  const handleSave = () => {
    const settings = { scaleMode, scaleValue, maxScenes };
    localStorage.setItem('movieClipperSettings', JSON.stringify(settings));
    alert('✅ Settings saved!');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>⚙️ Settings</Typography>

      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Default Scale Mode</FormLabel>
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
        {scaleMode === 'horizontal' ? `Width: ${scaleValue}px` : `Height: ${scaleValue}px`}
      </Typography>
      <Slider
        value={scaleValue}
        onChange={(e, newValue) => setScaleValue(newValue)}
        step={scaleMode === 'horizontal' ? 160 : 120}
        min={scaleMode === 'horizontal' ? 640 : 360}
        max={scaleMode === 'horizontal' ? 1920 : 1080}
        valueLabelDisplay="auto"
        sx={{ mb: 2 }}
      />

      <TextField
        label="Default Max Scenes"
        type="number"
        value={maxScenes}
        onChange={(e) => setMaxScenes(parseInt(e.target.value))}
        inputProps={{ min: 1, max: 10 }}
        sx={{ mb: 3 }}
      />

      <Button variant="contained" onClick={handleSave}>Save Settings</Button>
    </Box>
  );
}

export default Settings;