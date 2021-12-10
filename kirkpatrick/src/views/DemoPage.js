import React, { useState } from "react";
import { Box } from "@mui/material";
import { Pt, Group } from "pts";
import { QuickStartCanvas } from "react-pts-canvas";
import computeKirkpatrick from "../algorithm/kirkpatrick_1";

export default function DemoPage() {
  const [pts, setPts] = useState(new Group());
  const [outerTriangle, setOuterTriangle] = useState(new Group());

  let triangle;
  let triangleHole;
  let levels = [];

  if (pts.length > 0) {
    let info = computeKirkpatrick(pts, outerTriangle);
    triangle = info[0];
    triangleHole = info[1];
    let all_triangles = triangle.clone().insert(triangleHole.clone());

    levels.push([pts, triangle, triangleHole, all_triangles]);
    levels.push(...info[2]);
  }

  return (
    <Box sx={{ height: "100vh" }}>
      <QuickStartCanvas
        style={{ height: "100%" }}
        onStart={(space) => {
          let num_points = 10;
          let x_size = space.size.x * 0.3;
          let y_size = space.size.y * 0.3;
          let new_pts = [];
          for (let i = 0; i < num_points; i++) {
            new_pts.push(
              new Pt(
                space.size.x * 0.35 + Math.floor(x_size * Math.random()),
                space.size.y * 0.45 + Math.floor(y_size * Math.random())
              )
            );
          }
          new_pts.push(new_pts[0]);

          setPts(Group.fromPtArray(new_pts));

          setOuterTriangle(
            new Group(
              new Pt(space.size.x * 0.5, space.size.y * 0.01),
              new Pt(space.size.x * 0.01, space.size.y * 0.95),
              new Pt(space.size.x * 0.99, space.size.y * 0.95)
            )
          );
        }}
        onAnimate={(space, form, time) => {
          // draw large triangle
          let big_triangles = new Group(
            new Pt(space.size.x * 0.5, space.size.y * 0.01),
            new Pt(space.size.x * 0.01, space.size.y * 0.95),
            new Pt(space.size.x * 0.99, space.size.y * 0.95)
          );
          form.fill("#9ab").polygon(big_triangles);

          if (levels.length > 0) {
            // animate levels
            form
              .fill("#000")
              .polygons(levels[parseInt((time / 1000) % levels.length)][1]);
            // draw triangulation with hole
            form
              .fill("#411")
              .polygons(levels[parseInt((time / 1000) % levels.length)][2]);
            // draw points
            form
              .fill("#fff")
              .points(
                levels[parseInt((time / 1000) % levels.length)][0],
                5,
                "circle"
              );
          }
        }}
      />
    </Box>
  );
}

//   new_pts = [
//     new Pt(444, 343.25),
//     new Pt(904, 277.25),
//     new Pt(819, 363.25),
//     new Pt(761, 228.25),
//     new Pt(717, 308.25),
//     new Pt(768, 353.25),
//     new Pt(1071, 578.25),
//     new Pt(443, 203.25),
//     new Pt(564, 585.25),
//     new Pt(652, 361.25),
//   ];

//   new_pts = [
//     new Pt(529.3499755859375, 355.04998779296875),
//     new Pt(455.3500061035156, 493.04998779296875),
//     new Pt(337.3500061035156, 541.0499877929688),
//     new Pt(473.3500061035156, 522.0499877929688),
//     new Pt(323.3500061035156, 409.04998779296875),
//   ];
