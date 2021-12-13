import React, { useState, useRef } from "react";
import { Box } from "@mui/material";
import { Pt, Group } from "pts";
import { QuickStartCanvas } from "react-pts-canvas";
import GUI from "../components/GUI";
import { computeKirkpatrick, findLocation } from "../algorithm/kirkpatrick";
import { createColor } from "material-ui-color";

export default function DemoPage() {
  const [pts, setPts] = useState(new Group());
  const [outerTriangle, setOuterTriangle] = useState(new Group());
  const [n, setNum] = useState(10);
  const [outsideColor, setOutsideColor] = useState(createColor("#FFA908"));
  const [insideColor, setInsideColor] = useState(createColor("#72B4F6"));
  const [slide, setSlide] = useState(0);
  const [pointTriangle, setPointTriangle] = useState(new Group());
  const [generate, setGenerate] = useState(false);
  const [type, setType] = useState("");
  const pointer = useRef(new Pt());

  let triangle;
  let triangleHole;
  let levels = [];
  let dag = {};

  if (pts.length > 0) {
    let info = computeKirkpatrick(pts, outerTriangle);
    triangle = info[0];
    triangleHole = info[1];
    levels = [];
    levels.push(...info[2]);
    dag = info[3];
  }

  return (
    <Box sx={{ height: "100vh" }}>
      <Box sx={{ position: "absolute" }}>
        <GUI
          n={n}
          setNum={setNum}
          outsideColor={outsideColor}
          setOutsideColor={setOutsideColor}
          insideColor={insideColor}
          setInsideColor={setInsideColor}
          generate={generate}
          setGenerate={setGenerate}
          type={type}
          setType={setType}
        />
      </Box>
      <QuickStartCanvas
        style={{ height: "100%" }}
        onStart={(space) => {
          let num_points = n;
          let x_size = space.size.x * 0.3;
          let y_size = space.size.y * 0.3;
          let new_pts = [];
          for (let i = 0; i < num_points; i++) {
            new_pts.push(
              new Pt(
                space.size.x * 0.35 + Math.floor(x_size * Math.random()),
                space.size.y * 0.5 + Math.floor(y_size * Math.random())
              )
            );
          }

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

          // n changes
          if (parseInt(n) !== parseInt(pts.length) || generate) {
            setGenerate(false);
            let num_points = n;
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

            setPts(Group.fromPtArray(new_pts));

            setOuterTriangle(
              new Group(
                new Pt(space.size.x * 0.5, space.size.y * 0.01),
                new Pt(space.size.x * 0.01, space.size.y * 0.95),
                new Pt(space.size.x * 0.99, space.size.y * 0.95)
              )
            );

            if (pts.length > 0) {
              let info = computeKirkpatrick(pts, outerTriangle);
              triangle = info[0];
              triangleHole = info[1];

              levels = [];
              levels.push(...info[2]);

              dag = info[3];
            }
          }

          // animate
          if (type === "animate") {
            if (slide !== parseInt((time / 1000) % levels.length)) {
              setSlide((slide + 1) % levels.length);
            }

            // animate levels
            form
              .fill(insideColor.css.backgroundColor)
              .polygons(levels[slide][1]);
            // draw triangulation with hole
            form
              .fill(outsideColor.css.backgroundColor)
              .polygons(levels[slide][2]);
            // draw points
            form.fill("#fff").points(levels[slide][0], 5, "circle");
          } else {
            setSlide(0);
            form.fill(insideColor.css.backgroundColor).polygons(triangle);
            form.fill(outsideColor.css.backgroundColor).polygons(triangleHole);
            form.fill("#fff").points(pts, 5, "circle");
          }

          // find point
          if (type === "find") {
            space.bindMouse().bindTouch().play();
            form.fill("#455").point(space.pointer, 5);

            if (
              pointer.current.x !== space.pointer.x &&
              pointer.current.y !== space.pointer.y
            ) {
              pointer.current = space.pointer;
              let point_triangle = findLocation(
                pointer.current,
                dag,
                outerTriangle,
                levels.length
              );
              setPointTriangle(point_triangle);
            }

            form.fill("672").polygon(pointTriangle);
          }
        }}
      />
    </Box>
  );
}
