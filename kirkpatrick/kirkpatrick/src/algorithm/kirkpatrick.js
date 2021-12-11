import { Pt, Group, Polygon } from "pts";
import * as THREE from "three";

function ccw(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
}

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
  let triangles = [];

  if (pts.length > 0) {
    pts.pop();
  }

  while (pts.length > 3) {
    let broken = false;
    for (let i = 0; i < pts.length; i++) {
      let point = pts[i];
      let next;
      let prev;
      if (i + 1 < pts.length) {
        next = pts[i + 1];
      } else {
        next = pts[0];
      }
      if (i - 1 >= 0) {
        prev = pts[i - 1];
      } else {
        prev = pts[pts.length - 1];
      }

      let isAcute = ccw(prev, point, next) >= 0;

      // check no points are in triangle
      let triangle = new Group(prev, point, next, prev);
      let noPointInTriangle = true;
      for (let j = 0; j < pts.length; j++) {
        if (pts[j] !== point && pts[j] !== prev && pts[j] !== next) {
          if (Polygon.hasIntersectPoint(triangle, pts[j])) {
            noPointInTriangle = false;
            break;
          }
        }
      }

      if (noPointInTriangle && isAcute) {
        triangles.push(triangle);
        pts = pts.filter((item) => item !== point);
        broken = true;
        break;
      }
    }

    if (!broken) {
      console.log("broken");
      console.log(pts);
      break;
    }
  }

  triangles.push(pts);
  return Group.fromPtArray(triangles);
}

function convexHull(pts) {
  // find leftmost and rightmost
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

  // split into upper and lower hulls
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

  let calcDistance = (p, q, r) => {
    return Math.abs((q.x - p.x) * (p.y - r.y) - (p.x - r.x) * (q.y - p.y));
  };

  let calcFarthest = (pts, p, q) => {
    let farthest_point = new Pt();
    let farthest_distance = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < pts.length; i++) {
      let d = calcDistance(p, q, pts[i]);
      if (d > farthest_distance) {
        farthest_distance = d;
        farthest_point = pts[i];
      }
    }
    return farthest_point;
  };

  // find point farthest distance from line
  let farthest_upper =
    upper.length > 0 ? calcFarthest(upper, leftmost, rightmost) : false;
  let farthest_lower =
    lower.length > 0 ? calcFarthest(lower, leftmost, rightmost) : false;

  let isInside = (leftmost, rightmost, max, p) => {
    let ccw1 = ccw(leftmost, max, p);
    let ccw2 = ccw(rightmost, max, p);

    if (ccw1 * ccw2 < 0) {
      return true;
    } else {
      return false;
    }
  };

  // remove points in quad
  let remove = (pts, leftmost, rightmost, farthest) => {
    let remove = [];
    for (let i = 0; i < pts.length; i++) {
      let is_inside = isInside(leftmost, rightmost, farthest, pts[i]);

      if (is_inside) {
        remove.push(upper[i]);
      }
    }
    return remove;
  };

  let remove_upper = farthest_upper
    ? remove(upper, leftmost, rightmost, farthest_upper)
    : false;
  let remove_lower = farthest_lower
    ? remove(lower, leftmost, rightmost, farthest_lower)
    : false;

  // remove remove_indices from list
  let new_upper = remove_upper
    ? pts.filter((item) => {
        return !remove_upper.includes(item);
      })
    : false;
  let new_lower = remove_lower
    ? pts.filter((item) => {
        return !remove_lower.includes(item);
      })
    : false;

  let hull = (p, q, coords, hull_coords) => {
    if (!coords || coords.length == 0) {
      return hull_coords;
    }

    let maxima = [];
    for (let i = 0; i < coords.length; i++) {
      let ccw1 = ccw(p, q, coords[i]);

      if (ccw1 > 0) {
        maxima.push(coords[i]);
      }
    }

    let max = calcFarthest(maxima, p, q);

    let removePoints = remove(maxima, p, q, max);

    let new_coords = maxima.filter((item) => !removePoints.includes(item));

    if (new_coords.length > 0) {
      hull(p, max, new_coords, hull_coords);
      hull(max, q, new_coords, hull_coords);
    } else {
      hull_coords.push(p);
      hull_coords.push(q);
    }

    return hull_coords;
  };

  let top_left = hull(leftmost, farthest_upper, new_upper, []);
  let top_right = hull(farthest_upper, rightmost, new_upper, []);
  let bottom_right = hull(rightmost, farthest_lower, new_lower, []);
  let bottom_left = hull(farthest_lower, leftmost, new_lower, []);

  let hull_coords = top_left
    .concat(top_right)
    .concat(bottom_right)
    .concat(bottom_left);

  let filtered_hull_coords = [];
  for (let i = 0; i < hull_coords.length; i++) {
    if (!filtered_hull_coords.includes(hull_coords[i])) {
      filtered_hull_coords.push(hull_coords[i]);
    }
  }
  filtered_hull_coords.push(filtered_hull_coords[0]);
  return Group.fromPtArray(filtered_hull_coords);
}

function triangulateConvexHull(pts, hull) {
  pts = pts.splice(0, pts.length - 1);
  hull = hull.splice(0, hull.length - 1);

  // find index of pts same as hull
  let pt_index = 0;
  for (let i = 0; i < pts.length; i++) {
    if (pts[i].x == hull[0].x && pts[i].y == hull[0].y) {
      pt_index = i;
      break;
    }
  }

  let findIndex = (p, pts) => {
    for (let i = 0; i < pts.length; i++) {
      if (p.x == pts[i].x && p.y == pts[i].y) {
        return i;
      }
    }
    return -1;
  };

  // find polygons that still needs triangulating
  let polygons = [];
  for (let i = 0; i < hull.length; i++) {
    let end_index = findIndex(hull[i], pts);
    let start_index =
      i + 1 < hull.length
        ? findIndex(hull[i + 1], pts)
        : findIndex(hull[0], pts);

    let poly = pts.slice(start_index, end_index + 1);

    if (poly.length > 2) {
      poly.push(poly[0]);
      polygons.push(poly);
    }
  }

  // triangulate each polygon
  let triangulate_polygons = [];
  for (let i = 0; i < polygons.length; i++) {
    let triangles = triangulate(polygons[0]);
    for (let j = 0; j < triangles.length; j++) {
      triangulate_polygons.push(triangles[j]);
    }
  }

  return Group.fromPtArray(triangulate_polygons);
}

export default function computeKirkpatrick(pts) {
  let poly = new Group();
  let triangles = new Group();
  let hull = new Group();
  let triangulateHull = new Group();

  poly = polygon(pts.clone());
  triangles = triangulate(poly.clone());
  hull = convexHull(pts.clone());
  triangulateHull = triangulateConvexHull(poly.clone(), hull.clone());
  return [poly, triangles, hull, triangulateHull];
}
