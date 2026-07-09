/* Interactive graph-theory background: draggable nodes with spring physics. */
(function () {
  "use strict";

  var TWO_PI = Math.PI * 2;

  function polygon(n, r, phase) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (phase || 0) + (i / n) * TWO_PI - Math.PI / 2;
      pts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }
    return pts;
  }

  /* --- Classic graphs (local coordinates centered at 0,0) --- */

  function petersenGraph() {
    var outer = polygon(5, 62);
    var inner = polygon(5, 32);
    var nodes = outer.concat(inner);
    var edges = [];
    for (var i = 0; i < 5; i++) {
      edges.push([i, (i + 1) % 5]);          // outer pentagon
      edges.push([i, i + 5]);                // spokes
      edges.push([5 + i, 5 + ((i + 2) % 5)]); // inner pentagram
    }
    return { nodes: nodes, edges: edges };
  }

  function cubeGraph() {
    var a = polygon(4, 58, Math.PI / 4);
    var b = polygon(4, 28, Math.PI / 4);
    var nodes = a.concat(b);
    var edges = [];
    for (var i = 0; i < 4; i++) {
      edges.push([i, (i + 1) % 4]);
      edges.push([4 + i, 4 + ((i + 1) % 4)]);
      edges.push([i, i + 4]);
    }
    return { nodes: nodes, edges: edges };
  }

  function completeGraph5() {
    var nodes = polygon(5, 48);
    var edges = [];
    for (var i = 0; i < 5; i++)
      for (var j = i + 1; j < 5; j++) edges.push([i, j]);
    return { nodes: nodes, edges: edges };
  }

  function binaryTree() {
    var nodes = [
      { x: 0, y: -55 },
      { x: -42, y: -8 }, { x: 42, y: -8 },
      { x: -64, y: 42 }, { x: -20, y: 42 }, { x: 20, y: 42 }, { x: 64, y: 42 }
    ];
    var edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
    return { nodes: nodes, edges: edges };
  }

  /* Clusters anchored to viewport fractions (kept near page margins). */
  var CLUSTER_SPECS = [
    { graph: petersenGraph(), ax: 0.10, ay: 0.28 },
    { graph: cubeGraph(), ax: 0.90, ay: 0.22 },
    { graph: completeGraph5(), ax: 0.08, ay: 0.74 },
    { graph: binaryTree(), ax: 0.92, ay: 0.72 }
  ];

  var canvas, ctx, W, H, DPR;
  var nodes = [], edges = [];
  var dragged = null;

  function build() {
    nodes = [];
    edges = [];
    CLUSTER_SPECS.forEach(function (spec, c) {
      var base = nodes.length;
      spec.graph.nodes.forEach(function (p) {
        nodes.push({
          cluster: c,
          ox: p.x, oy: p.y,     // rest offset within cluster
          x: 0, y: 0, vx: 0, vy: 0
        });
      });
      spec.graph.edges.forEach(function (e) {
        var a = base + e[0], b = base + e[1];
        var dx = spec.graph.nodes[e[0]].x - spec.graph.nodes[e[1]].x;
        var dy = spec.graph.nodes[e[0]].y - spec.graph.nodes[e[1]].y;
        edges.push({ a: a, b: b, rest: Math.sqrt(dx * dx + dy * dy) });
      });
    });
    placeAtAnchors(true);
  }

  function anchorPos(c) {
    return {
      x: CLUSTER_SPECS[c].ax * W,
      y: CLUSTER_SPECS[c].ay * H
    };
  }

  function placeAtAnchors(hard) {
    nodes.forEach(function (n) {
      var a = anchorPos(n.cluster);
      if (hard) {
        n.x = a.x + n.ox;
        n.y = a.y + n.oy;
        n.vx = n.vy = 0;
      }
    });
  }

  function resize() {
    DPR = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    placeAtAnchors(true);
  }

  function step() {
    var i, n, e, a, b, dx, dy, d, f;

    // Springs along edges.
    for (i = 0; i < edges.length; i++) {
      e = edges[i];
      a = nodes[e.a]; b = nodes[e.b];
      dx = b.x - a.x; dy = b.y - a.y;
      d = Math.sqrt(dx * dx + dy * dy) || 1;
      f = 0.03 * (d - e.rest) / d;
      a.vx += f * dx; a.vy += f * dy;
      b.vx -= f * dx; b.vy -= f * dy;
    }

    // Weak pull back to each node's rest position (keeps clusters in place).
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var anc = anchorPos(n.cluster);
      n.vx += 0.012 * (anc.x + n.ox - n.x);
      n.vy += 0.012 * (anc.y + n.oy - n.y);
    }

    // Integrate.
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n === dragged) { n.vx = 0; n.vy = 0; continue; }
      n.vx *= 0.90; n.vy *= 0.90;
      n.x += n.vx; n.y += n.vy;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(20, 115, 174, 0.22)";
    ctx.beginPath();
    for (var i = 0; i < edges.length; i++) {
      var e = edges[i];
      ctx.moveTo(nodes[e.a].x, nodes[e.a].y);
      ctx.lineTo(nodes[e.b].x, nodes[e.b].y);
    }
    ctx.stroke();

    for (i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      ctx.beginPath();
      ctx.arc(n.x, n.y, n === dragged ? 7 : 5, 0, TWO_PI);
      ctx.fillStyle = n === dragged ? "#1473ae" : "rgba(142, 183, 220, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }

  function hitNode(x, y) {
    var best = null, bestD = 400; // 20px radius squared
    for (var i = 0; i < nodes.length; i++) {
      var dx = nodes[i].x - x, dy = nodes[i].y - y;
      var d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = nodes[i]; }
    }
    return best;
  }

  function onDown(ev) {
    var n = hitNode(ev.clientX, ev.clientY);
    if (n) {
      dragged = n;
      canvas.setPointerCapture(ev.pointerId);
      canvas.style.cursor = "grabbing";
      ev.preventDefault();
    }
  }

  function onMove(ev) {
    if (dragged) {
      dragged.x = ev.clientX;
      dragged.y = ev.clientY;
      ev.preventDefault();
    } else {
      canvas.style.cursor = hitNode(ev.clientX, ev.clientY) ? "grab" : "default";
    }
  }

  function onUp(ev) {
    if (dragged) {
      canvas.releasePointerCapture(ev.pointerId);
      dragged = null;
      canvas.style.cursor = "default";
    }
  }

  function init() {
    canvas = document.createElement("canvas");
    canvas.id = "graph-bg";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");

    resize();
    build();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    loop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
