document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("hex-svg");
  const centerx = 350;
  const centery = 350;
  const radii = [300, 200, 100];
  const layerNames = ["outer", "mid", "inner"];

  // to get vertices of hexagon
  function getpoints(cx, cy, r) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const radian = (Math.PI / 180) * (60 * i);
      const x = cx + r * Math.cos(radian);
      const y = cy + r * Math.sin(radian);
      points.push({ x, y });
    }
    return points;
  }
  // hexagon
  function drawHex(points) {
    const hexagon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    hexagon.setAttribute(
      "points",
      points.map((p) => `${p.x},${p.y}`).join(" ")
    );
    hexagon.setAttribute("stroke", "white");
    hexagon.setAttribute("stroke-width", "4");
    hexagon.setAttribute("fill", "none");
    svg.appendChild(hexagon);
  }

  function drawConnectingLine(p1, p2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
    line.setAttribute("stroke", "white");
    line.setAttribute("stroke-width", "4");
    svg.appendChild(line);

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", midX);
    text.setAttribute("y", midY - 15); // offset a bit above the line
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "15");
    text.setAttribute("font-family", "Arial");
    text.setAttribute("text-anchor", "middle");
    text.textContent = "1";
    svg.appendChild(text);
  }
  const circleData = {};
  //circle
  function drawCircle(x, y, layer, index) {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("r", "15");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("stroke", "white");
    circle.setAttribute("fill", "grey");
    circle.setAttribute("stroke-width", "4");
    svg.appendChild(circle);

    const key = `${layer}-${index}`;
    circleData[key] = { layer, index, element: circle };
  }
  console.log(circleData);

  const weightsMap = {
    300: [2, 1, 2, 3, 1, 1],
    200: [4, 6, 5, 4, 6, 5],
    100: [9, 8, 8, 9, 8, 8],
  };

  function drawWeights(r) {
    const angle = Math.PI / 3;
    const weights = weightsMap[r];

    for (let i = 0; i < 6; i++) {
      const x1 = centerx + (r - 20) * Math.cos(angle * i);
      const y1 = centery + (r - 20) * Math.sin(angle * i);
      const x2 = centerx + (r - 20) * Math.cos(angle * ((i + 1) % 6));
      const y2 = centery + (r - 20) * Math.sin(angle * ((i + 1) % 6));

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", midX);
      text.setAttribute("y", midY);
      text.setAttribute("fill", "white");
      text.setAttribute("font-size", "15");
      text.setAttribute("font-family", "Arial");
      text.setAttribute("text-anchor", "middle");
      text.textContent = weights[i];
      svg.appendChild(text);
    }
  }

  const hexLayers = {};
  radii.forEach((r, i) => {
    const layer = layerNames[i];
    const points = getpoints(centerx, centery, r);
    hexLayers[layer] = points;
    drawHex(points);
    drawWeights(r);
  });

  console.log(hexLayers);

  for (let i = 0; i < 6; i++) {
    if (i % 2 === 1) drawConnectingLine(hexLayers.outer[i], hexLayers.mid[i]);
    else drawConnectingLine(hexLayers.mid[i], hexLayers.inner[i]);
  }
  radii.forEach((r, i) => {
    const layer = layerNames[i];
    const points = getpoints(centerx, centery, r);
    points.forEach((p, idx) => drawCircle(p.x, p.y, layer, idx));
  });

  let midunlocked = false;
  let innerunlocked = false;
  // outer to inner
  function isAllowedToFill(layer) {
    if (layer === "mid") {
      return !Object.values(circleData).some(
        (c) => c.layer === "outer" && c.element.getAttribute("fill") === "grey"
      );
    }
    if (layer === "inner")
      return !Object.values(circleData).some(
        (c) => c.layer === "mid" && c.element.getAttribute("fill") === "grey"
      );

    return true;
  }

  let isRED = true;
  const chance = document.querySelector(".chance");
  let countB = 0;
  let countR = 0;

  function updateTurnUI() {
    chance.textContent = isRED ? "red" : "blue";
    chance.style.color = isRED ? "red" : "blue";
  }

  function getNeighboringCircles(circleMeta) {
    const neighbors = [];
    const sameLayer = Object.values(circleData).filter(
      (c) => c.layer === circleMeta.layer
    );
    if (circleMeta.layer === "mid" && circleMeta.index % 2 === 1) {
      const match = Object.values(circleData).find(
        (c) => c.layer === "outer" && c.index === circleMeta.index
      );
      if (match) neighbors.push(match);
    } else if (circleMeta.layer === "inner" && circleMeta.index % 2 === 0) {
      const match = Object.values(circleData).find(
        (c) => c.layer === "mid" && c.index === circleMeta.index
      );
      if (match) neighbors.push(match);
    }

    const prev = sameLayer.find((c) => c.index === (circleMeta.index + 5) % 6);
    const next = sameLayer.find((c) => c.index === (circleMeta.index + 1) % 6);
    if (prev) neighbors.push(prev);
    if (next) neighbors.push(next);

    return neighbors;
  }

  function handleClick(circleMeta) {
    const currColor = circleMeta.element.getAttribute("fill");
    const playerColor = isRED ? "red" : "blue";

    const isInitialMoves = (isRED && countR < 4) || (!isRED && countB < 4);

    if (isInitialMoves) {
      if (currColor === "grey") {
        circleMeta.element.setAttribute("fill", playerColor);
        if (isRED) countR++;
        else countB++;
        isRED = !isRED;
        updateTurnUI();
      }
      return;
    }

    // After initial moves
    if (currColor !== "grey") return;

    const neighbors = getNeighboringCircles(circleMeta);
    const neighborWithPlayerColor = neighbors.find(
      (n) => n.element.getAttribute("fill") === playerColor
    );

    if (neighborWithPlayerColor) {
      neighborWithPlayerColor.element.setAttribute("fill", "grey");
      circleMeta.element.setAttribute("fill", playerColor);
      isRED = !isRED;
      updateTurnUI();
    }
  }

  Object.values(circleData).forEach((c) => {
    c.element.addEventListener("click", () => handleClick(c));
  });

  updateTurnUI();
});
