import React, { useState, useEffect } from 'react';
import { Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';

function Scenes() {
  const [scenes, setScenes] = useState([]);

  const fetchScenes = async () => {
    const response = await fetch('http://localhost:4000/api/scenes');
    const data = await response.json();
    setScenes(data.scenes || []);
  };

  useEffect(() => {
    fetchScenes();
    const interval = setInterval(fetchScenes, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>🎭 Popular Scenes</Typography>
      {scenes.map((scene) => (
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{scene.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{scene.gpt_response}</Typography>
            </AccordionDetails>
          </Accordion>
        </motion.div>
      ))}
    </Box>
  );
}

export default Scenes;