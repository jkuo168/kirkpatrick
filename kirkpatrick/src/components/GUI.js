import React, { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Divider,
  List,
  ListItemText,
  ListItemButton,
  Radio,
  TextField,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { ColorPicker } from "material-ui-color";

export default function GUI(props) {
  const [open, setOpen] = useState(true);

  return (
    <Box>
      <List
        component="nav"
        dense={true}
        sx={{
          width: "100%",
          minWidth: 200,
          maxWidth: 200,
          bgcolor: "background.paper",
        }}
      >
        <ListItemButton
          onClick={() => {
            setOpen(!open);
          }}
        >
          <ListItemText primary="GUI" sx={{ color: "white" }} />
          {open ? (
            <ExpandLess sx={{ color: "white" }} />
          ) : (
            <ExpandMore sx={{ color: "white" }} />
          )}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding dense={true}>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ ml: 2, mr: 2, mb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  pb: 1,
                  alignItems: "center",
                  justifyItems: "center",
                }}
              >
                <ListItemText primary="N" sx={{ color: "white" }} />
                <TextField
                  size="small"
                  type="number"
                  value={props.n}
                  onChange={(e) => {
                    if (e.target.value >= 3) {
                      props.setNum(e.target.value);
                    } else {
                      props.setNum(3);
                    }
                  }}
                  sx={{ width: "50%", align: "right" }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyItems: "center",
                }}
              >
                <ListItemText primary="Animate" sx={{ color: "white" }} />
                <Radio
                  checked={props.type === "animate"}
                  onClick={() => {
                    if (props.type === "animate") {
                      props.setType("");
                    } else {
                      props.setType("animate");
                    }
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyItems: "center",
                }}
              >
                <ListItemText primary="Find Point" sx={{ color: "white" }} />
                <Radio
                  checked={props.type === "find"}
                  onClick={() => {
                    if (props.type === "find") {
                      props.setType("");
                    } else {
                      props.setType("find");
                    }
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyItems: "center",
                }}
              >
                <ListItemText primary="Color" sx={{ color: "white" }} />
              </Box>
              <Box sx={{ pl: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyItems: "center",
                  }}
                >
                  <ListItemText
                    primary="Outside"
                    sx={{ color: "white", mr: 7 }}
                  />
                  <ColorPicker
                    hideTextfield
                    onChange={(color) => {
                      props.setOutsideColor(color);
                    }}
                    value={props.outsideColor}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyItems: "center",
                  }}
                >
                  <ListItemText
                    primary="Inside"
                    sx={{ color: "white", mr: 7 }}
                  />
                  <ColorPicker
                    hideTextfield
                    onChange={(color) => {
                      props.setInsideColor(color);
                    }}
                    value={props.insideColor}
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyItems: "center",
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    props.setGenerate(true);
                  }}
                >
                  Generate
                </Button>
              </Box>
            </Box>
          </List>
        </Collapse>
      </List>
    </Box>
  );
}
