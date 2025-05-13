document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("hex-svg");
  const centerx = 350;
  const centery = 350;
  const radii = [300, 200, 100];
  const layerNames = ["outer", "mid", "inner"];
  document.getElementById("playBtn").addEventListener("click", resumeCountdown);
  document.getElementById("pauseBtn").addEventListener("click", pauseCountdown);
  document.getElementById("resetBtn").addEventListener("click", resetCountdown);
  document.getElementById("newGameBtn").addEventListener("click", () => {
    document.getElementById("winnerBox").style.display = "none";
    resetCountdown();
  });

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
    text.setAttribute("y", midY - 15);
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "15");
    text.setAttribute("font-family", "Arial");
    text.setAttribute("text-anchor", "middle");
    text.textContent = "1";
    svg.appendChild(text);
  }
  const circleId = [];
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

    circleId.push({ layer, index, element: circle });
  }
  console.log(circleId);

  const numbers = [-2, 2, 6];

  function drawWeights(r, X, layer) {
    const angle = Math.PI / 3;
    const weights = [];
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
      const value = Math.floor(Math.random() * 3) + r / 100 + X;
      text.textContent = value;
      weights.push({
        initial: { layer, index: i },
        weight: value,
        final: { layer, index: (i + 1) % 6 },
      });
      svg.appendChild(text);
    }
    return weights;
  }
  const weightid = [];

  const hexLayers = {};
  radii.forEach((r, i) => {
    const layer = layerNames[i];
    const points = getpoints(centerx, centery, r);
    hexLayers[layer] = points;
    drawHex(points);
    weightid.push(...drawWeights(r, numbers[i], layer));
  });

  console.log(hexLayers);
  console.log(weightid);

  for (let i = 0; i < 6; i++) {
    if (i % 2 === 1) {
      drawConnectingLine(hexLayers.outer[i], hexLayers.mid[i]);
      weightid.push({
        initial: { layer: "outer", index: i },
        final: { layer: "mid", index: i },
        weight: 1,
      });
    } else {
      drawConnectingLine(hexLayers.mid[i], hexLayers.inner[i]);
      weightid.push({
        initial: { layer: "mid", index: i },
        final: { layer: "inner", index: i },
        weight: 1,
      });
    }
  }
  console.log(weightid);
  radii.forEach((r, i) => {
    const layer = layerNames[i];
    const points = getpoints(centerx, centery, r);
    points.forEach((p, idx) => drawCircle(p.x, p.y, layer, idx));
  });

  let midunlocked = false;
  let innerunlocked = false;

  function unlock(clickedCircle) {
    if (clickedCircle.layer === "outer") {
      return true;
    }

    if (!midunlocked) {
      const outercircle = circleId.filter((c) => c.layer === "outer");
      const filledcount = outercircle.filter(
        (c) => c.element.getAttribute("fill") !== "grey"
      ).length;
      if (filledcount === 6) {
        midunlocked = true;
      }
    }

    if (clickedCircle.layer === "mid") {
      return midunlocked;
    }

    if (!innerunlocked) {
      const midcircle = circleId.filter((c) => c.layer === "mid");
      const filledCount = midcircle.filter(
        (c) => c.element.getAttribute("fill") !== "grey"
      ).length;
      if (filledCount === 6) {
        innerunlocked = true;
      }
    }

    if (clickedCircle.layer === "inner") {
      return innerunlocked;
    }

    return false;
  }

  let isRED = true;
  const chance = document.querySelector("#chance");
  let countB = 0;
  let countR = 0;

  function updateTurnUI() {
    chance.textContent = isRED ? "red" : "blue";
    chance.style.color = isRED ? "red" : "blue";
  }

  function getNeighboringCircles(clickedCircle) {
    const neighbors = [];
    const sameLayer = circleId.filter((c) => c.layer === clickedCircle.layer);
    if (clickedCircle.layer === "mid" && clickedCircle.index % 2 === 1) {
      const match = circleId.find(
        (c) => c.layer === "outer" && c.index === clickedCircle.index
      );
      if (match) neighbors.push(match);
    } else if (
      clickedCircle.layer === "inner" &&
      clickedCircle.index % 2 === 0
    ) {
      const match = circleId.find(
        (c) => c.layer === "mid" && c.index === clickedCircle.index
      );
      if (match) neighbors.push(match);
    }

    const prev = sameLayer.find(
      (c) => c.index === (clickedCircle.index + 5) % 6
    );
    const next = sameLayer.find(
      (c) => c.index === (clickedCircle.index + 1) % 6
    );
    if (prev) neighbors.push(prev);
    if (next) neighbors.push(next);

    return neighbors;
  }

  function updateScore() {
    let redScore = 0;
    let blueScore = 0;

    weightid.forEach(({ initial, final, weight }) => {
      const circleA = circleId.find(
        (c) => c.layer === initial.layer && c.index === initial.index
      );
      const circleB = circleId.find(
        (c) => c.layer === final.layer && c.index === final.index
      );

      if (circleA && circleB) {
        const colorA = circleA.element.getAttribute("fill");
        const colorB = circleB.element.getAttribute("fill");

        if (colorA === colorB && colorA !== "grey") {
          const intWeight = parseInt(weight);

          if (colorA === "red") {
            redScore += intWeight;
          } else if (colorA === "blue") {
            blueScore += intWeight;
          }
        }
      }
    });

    document.getElementById("redScore").textContent = redScore;
    document.getElementById("blueScore").textContent = blueScore;
  }

  let time = 5 * 60;
  let countdownInterval;

  const countdown = document.querySelector(".countdown p");

  function updatecountdown() {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    countdown.innerHTML = ` 0${minutes}:${seconds}`;
    time--;

    if (time < 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      checkForWinner();
    }
  }

  let playerTimer;
  let timeleft = 30;

  function updateplayertimer() {
    clearInterval(playerTimer);
    timeleft = 30;
    const timeDisplay = document.querySelector(".timer p");
    const currentPlayer = isRED ? "Red" : "Blue";
    timeDisplay.textContent = `${currentPlayer}'s time left:${timeleft}s`;

    playerTimer = setInterval(() => {
      timeleft--;
      timeDisplay.textContent = `${currentPlayer}'s time left:${timeleft}s`;

      if (timeleft <= 0) {
        clearInterval(playerTimer);
        alert(`${currentPlayer}'s time is up!`);

        isRED = !isRED;
        updateTurnUI();
        updateplayertimer();
      }
    }, 1000);
  }

  function pauseCountdown() {
    clearInterval(countdownInterval);
    clearInterval(playerTimer);
    countdownInterval = null;
    playerTimer = null;
  }

  function resumeCountdown() {
    if (!countdownInterval)
      countdownInterval = setInterval(updatecountdown, 1000);

    if (!playerTimer) updateplayertimer();
  }

  function resetCountdown() {
    clearInterval(countdownInterval);
    clearInterval(playerTimer);

    time = 5 * 60;
    timeleft = 30;

    updatecountdown();
    countdownInterval = setInterval(updatecountdown, 1000);

    updateplayertimer();
    circleId.forEach((c) => {
      c.element.setAttribute("fill", "grey");
    });

    countR = 0;
    countB = 0;
    isRED = true;
    midunlocked = false;
    innerunlocked = false;
    updateTurnUI();

    document.querySelector("#redScore").textContent = "0";
    document.querySelector("#blueScore").textContent = "0";
    alert("game is restart");
  }

  function checkForWinner() {
    const redScore = parseInt(document.getElementById("redScore").textContent);
    const blueScore = parseInt(
      document.getElementById("blueScore").textContent
    );

    const winnerMessage = document.getElementById("winnerMessage");

    let message = "";

    if (redScore > blueScore) {
      message = "Red wins!";
    } else if (blueScore > redScore) {
      message = "Blue wins";
    } else {
      message = "It's a tie";
    }

    winnerMessage.textContent = message;
    winnerMessage.style.color = "white";

    document.getElementById("winnerBox").style.display = "flex";
  }

  function handleClick(clickedCircle) {
    if (!countdownInterval) {
      countdownInterval = setInterval(updatecountdown, 1000);
    }

    const isUnlock = unlock(clickedCircle);
    if (!isUnlock) return;

    const currColor = clickedCircle.element.getAttribute("fill");
    const playerColor = isRED ? "red" : "blue";

    const isInitialMoves = (isRED && countR < 4) || (!isRED && countB < 4);

    if (isInitialMoves) {
      if (currColor === "grey") {
        clickedCircle.element.setAttribute("fill", playerColor);
        if (isRED) countR++;
        else countB++;
        isRED = !isRED;
        updateTurnUI();
        updateScore();
        updateplayertimer();
      }

      return;
    }

    if (currColor !== "grey") return;

    const neighbors = getNeighboringCircles(clickedCircle);
    const neighborWithPlayerColor = neighbors.find(
      (n) => n.element.getAttribute("fill") === playerColor
    );

    if (neighborWithPlayerColor) {
      neighborWithPlayerColor.element.setAttribute("fill", "grey");
      clickedCircle.element.setAttribute("fill", playerColor);
      isRED = !isRED;
      updateTurnUI();
      updateScore();
      updateplayertimer();
    }

    const innerFilled = circleId
      .filter((c) => c.layer === "inner")
      .every((c) => c.element.getAttribute("fill") !== "grey");

    if (innerFilled) {
      clearInterval(countdownInterval);
      clearInterval(playerTimer);
      checkForWinner();
    }
  }

  circleId.forEach((c) => {
    c.element.addEventListener("click", () => handleClick(c));
  });

  updateTurnUI();
});
