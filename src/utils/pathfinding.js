import { EntityTypes } from './entityTypes';

class Node {
  constructor(x, y, g = 0, h = 0) {
    this.x = x;
    this.y = y;
    this.g = g; // Cost from start to current node
    this.h = h; // Heuristic (estimated cost from current to end)
    this.f = g + h; // Total cost
    this.parent = null;
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
}

const manhattan = (x1, y1, x2, y2) => {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

const isFreeTile = (maze, x, y) => {
  const tile = maze[y][x];
  // Consider both empty tiles and enemy positions as walkable
  return tile === 0 || tile === 4; // 4 is enemy position in maze
};

export const findPath = (maze, start, end) => {
  if (!maze || !start || !end) {
    console.log('Missing parameters:', { maze: !!maze, start, end });
    return null;
  }

  // Check if start and end are valid positions
  if (!isFreeTile(maze, start.x, start.y)) {
    console.log('Start position is not a free tile:', {
      x: start.x,
      y: start.y,
      tile: maze[start.y][start.x]
    });
    return null;
  }
  
  if (!isFreeTile(maze, end.x, end.y)) {
    console.log('End position is not a free tile:', {
      x: end.x,
      y: end.y,
      tile: maze[end.y][end.x]
    });
    return null;
  }

  const openList = [];
  const closedList = [];
  const startNode = new Node(start.x, start.y);
  const endNode = new Node(end.x, end.y);
  
  startNode.h = manhattan(startNode.x, startNode.y, endNode.x, endNode.y);
  openList.push(startNode);

  while (openList.length > 0) {
    let currentIndex = 0;
    for (let i = 0; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }
    const current = openList[currentIndex];

    if (current.x === endNode.x && current.y === endNode.y) {
      const path = [];
      let temp = current;
      while (temp) {
        path.unshift({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return path;
    }

    openList.splice(currentIndex, 1);
    closedList.push(current);

    const neighbors = [
      { dx: 0, dy: -1 }, // up
      { dx: 1, dy: 0 },  // right
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }  // left
    ];

    for (const { dx, dy } of neighbors) {
      const newX = current.x + dx;
      const newY = current.y + dy;

      // Check bounds
      if (newX < 0 || newX >= maze[0].length || 
          newY < 0 || newY >= maze.length) {
        continue;
      }

      // Only consider free tiles
      if (!isFreeTile(maze, newX, newY)) {
        continue;
      }

      const neighbor = new Node(newX, newY);

      if (closedList.some(node => node.equals(neighbor))) {
        continue;
      }

      const tentativeG = current.g + 1;

      const openNode = openList.find(node => node.equals(neighbor));
      if (!openNode) {
        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = manhattan(neighbor.x, neighbor.y, endNode.x, endNode.y);
        neighbor.f = neighbor.g + neighbor.h;
        openList.push(neighbor);
      } else if (tentativeG < openNode.g) {
        openNode.parent = current;
        openNode.g = tentativeG;
        openNode.f = openNode.g + openNode.h;
      }
    }
  }

  return null;
}; 