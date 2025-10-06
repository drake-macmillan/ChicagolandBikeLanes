// Enhanced styling function with canvas renderer support
export function getStyle(feature) {
  const type = feature.properties.displayrou;
  const isOneway = feature.properties.br_oneway === "Y";
  const status = feature.properties.status;

  console.log('Styling feature:', type, 'status:', status); // Debug line

  const styles = {
    "Protected Bike Lane":        { color: "#2547cf", weight: 3.5, dashArray: null },
    "Painted Lane, Large":        { color: "#e05b1d", weight: 3, dashArray: "4,8" },
    "Painted Lane":               { color: "#e05b1d", weight: 1.8, dashArray: "4,8" },
    "Chill Side Street":          { color: "#2547cf", weight: 2, dashArray: "4,4" },
    "Paved Trail":                { color: "#000080", weight: 4.5, dashArray: null },
    "Unpaved Trail":              { color: "#5A4B49", weight: 4.5, dashArray: null },
  };

  const baseStyle = styles[type] || { color: "#FFC0CB", weight: 10 }; //unstyled lines are very obvious, so they can be renamed

  // Add arrow properties for one-way routes
  if (isOneway) {
    baseStyle.showArrows = true;
  }

  // Pass status to renderer for special handling
  if (status === 'under construction' || status === 'under construction, blocked') {
    baseStyle.status = status; // Pass the status to the renderer
    console.log('Marked line as under construction for renderer'); // Debug line
  }

  console.log('Final style:', baseStyle); // Debug line
  return baseStyle;
}

// Custom Canvas Renderer with Arrow Support and Under Construction Styling
const ArrowRenderer = L.Canvas.extend({
  _updatePoly: function(layer, closed) {
  const ctx = this._ctx;
  let shadowApplied = false;

  // Temporarily override dash array if needed
  const origDash = ctx.getLineDash ? ctx.getLineDash() : [];

  if (layer.options.status === 'under construction') {
    console.log('Rendering under construction line with green shadow');
    ctx.save();
    ctx.shadowColor = 'green';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Temporarily remove dashes for shadow
    if (layer.options.dashArray) {
      ctx.setLineDash([]);
    }

    L.Canvas.prototype._updatePoly.call(this, layer, closed);

    ctx.restore();
    shadowApplied = true;
  }

  if (layer.options.status === 'under construction, blocked') {
    console.log('Rendering under construction line with red shadow');
    ctx.save();
    ctx.shadowColor = 'red';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (layer.options.dashArray) {
      ctx.setLineDash([]);
    }

    L.Canvas.prototype._updatePoly.call(this, layer, closed);

    ctx.restore();
    shadowApplied = true;
  }

  // Draw the actual line (with proper dashes, if any)
  if (shadowApplied && layer.options.dashArray) {
    ctx.setLineDash(layer.options.dashArray.split(',').map(Number));
    L.Canvas.prototype._updatePoly.call(this, layer, closed);
    ctx.setLineDash(origDash);
  } else if (!shadowApplied) {
    L.Canvas.prototype._updatePoly.call(this, layer, closed);
  }

  if (layer.options.showArrows && !closed) {
    console.log('Drawing arrows for layer');
    this._drawArrows(layer);
  }
},

  _drawArrows: function(layer) {
    const ctx = this._ctx;
    const parts = layer._parts;
    const options = layer.options;

    if (!parts.length) return;

    // Arrow configuration
    const arrowSize = 5;
    const arrowSpacing = 35; // pixels between arrows

    ctx.save();
    ctx.setLineDash([]);
    ctx.strokeStyle = options.color;
    ctx.fillStyle = options.color;
    ctx.lineWidth = Math.max(1, options.weight * 0.7);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    parts.forEach(part => {
      if (part.length < 2) return;

      // Calculate total path length
      let totalLength = 0;
      const segments = [];

      for (let i = 0; i < part.length - 1; i++) {
        const start = part[i];
        const end = part[i + 1];
        const length = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        segments.push({ start, end, length });
        totalLength += length;
      }

      // Place arrows along the path
      const numArrows = Math.max(1, Math.floor(totalLength / arrowSpacing));

      for (let i = 0; i < numArrows; i++) {
        const targetDistance = (totalLength / (numArrows + 1)) * (i + 1);
        const arrowPos = this._getPointAtDistance(segments, targetDistance);

        if (arrowPos) {
          this._drawArrow(ctx, arrowPos.x, arrowPos.y, arrowPos.angle, arrowSize);
        }
      }
    });

    ctx.restore();
  },

  _getPointAtDistance: function(segments, targetDistance) {
    let currentDistance = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (currentDistance + segment.length >= targetDistance) {
        const segmentProgress = (targetDistance - currentDistance) / segment.length;

        const x = segment.start.x + (segment.end.x - segment.start.x) * segmentProgress;
        const y = segment.start.y + (segment.end.y - segment.start.y) * segmentProgress;

        const angle = Math.atan2(
          segment.end.y - segment.start.y,
          segment.end.x - segment.start.x
        );

        return { x, y, angle };
      }

      currentDistance += segment.length;
    }

    return null;
  },

  _drawArrow: function(ctx, x, y, angle, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.6, -size * 0.6);
    ctx.lineTo(-size * 0.3, 0);
    ctx.lineTo(-size * 0.6, size * 0.6);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
});

// Export the ArrowRenderer so it can be used in other files
export { ArrowRenderer };
