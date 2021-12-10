import { Pt, Group, Polygon } from "pts";
import * as THREE from "three";

function polygon(pts) {
  let polygon = [];
  let leftmost = new Pt(Number.POSITIVE_INFINITY, 0);
  let rightmost = new Pt(Number.NEGATIVE_INFINITY, 0);

  for (let i = 0; i < pts.length; i++) {
    if (leftmost.x > pts[i].x) {
      leftmost = pts[i];
    }
    if (rightmost.x < pts[i].x) {
      rightmost = pts[i];
    }
  }

  let upper = [];
  let lower = [];

  let isInUpper = (p) => {
    let slope = (rightmost.y - leftmost.y) / (rightmost.x - leftmost.x);
    let b = leftmost.y - slope * leftmost.x;
    return slope * p.x + b > p.y;
  };

  for (let i = 0; i < pts.length; i++) {
    if (isInUpper(pts[i])) {
      upper.push(pts[i]);
    } else {
      lower.push(pts[i]);
    }
  }

  let sortX = (pts) => {
    return pts.sort((a, b) => a.x - b.x);
  };

  let sorted_upper = sortX(upper);
  let sorted_lower = sortX(lower);

  polygon = sorted_upper.concat(sorted_lower.reverse());
  polygon = polygon.concat(polygon[0]);
  return Group.fromPtArray(polygon);
}

function triangulate(pts) {
  let convert = (pts) => {
    let vertices = [];

    for (let i = 0; i < pts.length; i++) {
      vertices.push(new THREE.Vector2(pts[i].x, pts[i].y));
    }
    return vertices;
  };

  let vertices = convert(pts);

  let triangulate = THREE.ShapeUtils.triangulateShape(vertices, []);

  let triangles = [];
  for (let i = 0; i < triangulate.length; i++) {
    let a = new Pt(
      vertices[triangulate[i][0]].x,
      vertices[triangulate[i][0]].y
    );
    let b = new Pt(
      vertices[triangulate[i][1]].x,
      vertices[triangulate[i][1]].y
    );
    let c = new Pt(
      vertices[triangulate[i][2]].x,
      vertices[triangulate[i][2]].y
    );
    triangles.push(new Group(a, b, c, a));
  }
  return Group.fromPtArray(triangles);
}

function triangulateHole(pts, hole) {
  let convert = (pts) => {
    let vertices = [];

    for (let i = 0; i < pts.length; i++) {
      vertices.push(new THREE.Vector2(pts[i].x, pts[i].y));
    }
    return vertices;
  };
  let vertices = convert(pts);

  let holes = [];
  let h = [];
  for (let i = 0; i < hole.length; i++) {
    h.push(new THREE.Vector2(hole[i].x, hole[i].y));
  }
  holes.push(h);

  let triangulate = THREE.ShapeUtils.triangulateShape(vertices, holes);

  let triangles = [];
  for (let i = 0; i < triangulate.length; i++) {
    let convert = (index, vertices, holes) => {
      if (index >= vertices.length) {
        return new Pt(
          holes[index - vertices.length].x,
          holes[index - vertices.length].y
        );
      } else {
        return new Pt(vertices[index].x, vertices[index].y);
      }
    };
    let a = convert(triangulate[i][0], vertices, holes[0]);
    let b = convert(triangulate[i][1], vertices, holes[0]);
    let c = convert(triangulate[i][2], vertices, holes[0]);
    triangles.push(new Group(a, b, c, a));
  }
  return Group.fromPtArray(triangles);
}

function computeAdjacencyGraph(triangles) {
  let adjacency = {};

  for (let i = 0; i < triangles.length; i++) {
    let a = triangles[i][0];
    let b = triangles[i][1];
    let c = triangles[i][2];

    let includes = (p, array) => {
      for (let i = 0; i < array.length; i++) {
        if (array[i].x === p.x && array[i].y === p.y) {
          return true;
        }
      }
      return false;
    };

    let add = (a, b) => {
      if (!adjacency[a]) {
        adjacency[a] = [];
      }
      if (!adjacency[b]) {
        adjacency[b] = [];
      }
      if (!includes(b, adjacency[a])) {
        adjacency[a].push(b);
      }

      if (!includes(a, adjacency[b])) {
        adjacency[b].push(a);
      }
    };

    add(a, b);
    add(a, c);
    add(b, c);
  }

  return adjacency;
}

function findIndependentSet(triangles, outer_triangle) {
  let independent_set = [];
  let adjacency = computeAdjacencyGraph(triangles);

  let keys = Object.keys(adjacency);
  for (let i = 0; i < keys.length; i++) {
    let convertToPoint = (p) => {
      let s = p.split(",");
      let n = [];
      for (let j = 0; j < s.length; j++) {
        n = n.concat(s[j].split("("));
      }

      let f = [];
      for (let j = 0; j < n.length; j++) {
        f = f.concat(n[j].split(")"));
      }

      return new Pt(parseFloat(f[1]), parseFloat(f[2]));
    };

    let includes = (p, array) => {
      for (let i = 0; i < array.length; i++) {
        if (array[i].x === p.x && array[i].y === p.y) {
          return true;
        }
      }
      return false;
    };

    // convert string to point
    let k = convertToPoint(keys[i]);

    // if it is not part of the big triangle
    if (!includes(k, outer_triangle)) {
      // if its adjacent list has no point in independent set
      let neighbors = adjacency[keys[i]];
      let independent = true;
      for (let j = 0; j < neighbors.length; j++) {
        if (includes(neighbors[j], independent_set)) {
          independent = false;
        }
      }

      if (independent) {
        independent_set.push(k);
      }
    }
  }

  return Group.fromPtArray(independent_set);
}

function kirkpatrick(pts, triangles, outer_triangle) {
  // find independent set
  let independent_set = findIndependentSet(triangles, outer_triangle);

  // remove points from list
  let equal = (a, b) => {
    return a.x === b.x && a.y === b.y;
  };

  for (let i = 0; i < independent_set.length; i++) {
    pts = pts.filter((item) => {
      return !equal(item, independent_set[i]);
    });
  }

  // close polygon
  if (!equal(pts[0], pts[pts.length - 1])) {
    pts.push(pts[0]);
  }

  // re-triangulate
  let new_triangles = triangulate(pts.clone());
  let new_triangles_hole = triangulateHole(outer_triangle.clone(), pts.clone());
  let all_triangles = new_triangles.clone().insert(new_triangles_hole.clone());

  return [pts, new_triangles, new_triangles_hole, all_triangles];
}

export default function computeKirkpatrick(pts, outer_triangle) {
  pts = polygon(pts);

  // triangulate polygon
  let triangles = triangulate(pts.clone());

  // triangulate hole
  let triangles_hole = triangulateHole(outer_triangle.clone(), pts.clone());

  // compute kirkpatrick's algorithm
  let all_triangles = triangles.clone().insert(triangles_hole.clone());
  let levels = [];
  let [points, new_triangles, new_triangles_hole, new_all_triangles] =
    kirkpatrick(pts, all_triangles.clone(), outer_triangle.clone());

  levels.push([points, new_triangles, new_triangles_hole, new_all_triangles]);

  while (new_triangles.length != 0) {
    [points, new_triangles, new_triangles_hole, new_all_triangles] =
      kirkpatrick(
        points.clone(),
        new_all_triangles.clone(),
        outer_triangle.clone()
      );
    levels.push([points, new_triangles, new_triangles_hole, new_all_triangles]);
  }

  return [triangles, triangles_hole, levels];
}
