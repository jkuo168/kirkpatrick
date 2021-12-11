import React from "react";
import { Box, Typography, Button } from "@mui/material";

export default function HomePage() {
  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h2" sx={{ color: "white" }}>
          Kirkpatrick's Algorithm
        </Typography>
        <Button variant="contained" href="#/demo" sx={{ mt: 10 }}>
          Demo
        </Button>
      </Box>
    </Box>
  );
}
