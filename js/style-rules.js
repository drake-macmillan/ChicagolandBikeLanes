// Enhanced styling function with canvas renderer support
export function getStyle(feature) {
  const type = feature.properties.displayrou;
  const isOneway = feature.properties.br_oneway === "Y";
  const status = feature.properties.status; // Get status from feature properties
  
  console.log('Styling feature:', type, 'isOneway:', isOneway, 'status:', status); // Debug line
  
  const styles = {
    "Protected Bike Lane":        { color: "#2547cf", weight: 4, dashArray: null },
    "Painted Lane, Large":        { color: "#e05b1d", weight: 3.5, dashArray: "4,8" },
    "Painted Lane":               { color: "#e05b1d", weight: 1.5, dashArray: "4,8" },
    "2-way Mellow Route/Greenway":{ color: "#2547cf", weight: 3, dashArray: "4,4" }, //will delete once I confirm new format works
    "1-way Mellow Route/Greenway":{ color: "#2547cf", weight: 2, dashArray: "4,4" },  //will delete once I confirm new format works
    "Chill Side Street":          { color: "#2547cf", weight: 2.5, dashArray: "4,4" },
    "Paved Trail":                { color: "#000080", weight: 4.5, dashArray: null },
    "Unpaved Trail":              { color: "#5A4B49", weight: 4.5, dashArray: null },
  };
  
  const baseStyle = styles[type] || { color: "#AAAAAA", weight: 1 };

  // Add arrow properties for one-way routes
  if (isOneway) {
    baseStyle.showArrows = true;
    console.log('Added showArrows to style'); // Debug line
  }

  // Add red shadow for under construction (requires SVG renderer)
  if (status === 'under construction') {
    baseStyle.className = 'under-construction-line';
    console.log('Added under construction styling with shadow'); // Debug line
  }
  
  console.log('Final style:', baseStyle); // Debug line
  return baseStyle;
}

// Custom Canvas Renderer with Arrow Support
const ArrowRenderer = L.Canvas.extend({
  _updatePoly: function(layer, closed) {
    // Draw shadow first if under construction
    if (layer.options.underConstruction) {
      console.log('Drawing shadow for under construction line'); // Debug
      this._drawShadow(layer, closed);
    }
    
    // Call the original _updatePoly method
    L.Canvas.prototype._updatePoly.call(this, layer, closed);
    
    // Add arrows if the layer has showArrows property
    if (layer.options.showArrows && !closed) {
      console.log('Drawing arrows for layer'); // Debug line
      this._drawArrows(layer);
    }
  },
  
  _drawShadow: function(layer, closed) {
    const ctx = this._ctx;
    const parts = layer._parts;
    const options = layer.options;
    
    if (!parts.length) return;
    
    // Draw multiple offset lines to create a glow effect
    const offsets = [
      {x: 0, y: 0, alpha: 0.8, width: options.weight + 4},
      {x: 1, y: 1, alpha: 0.6, width: options.weight + 2},
      {x: -1, y: -1, alpha: 0.6, width: options.weight + 2}
    ];
    
    ctx.save();
    
    offsets.forEach(offset => {
      ctx.strokeStyle = `rgba(255, 0, 0, ${offset.alpha})`;
      ctx.lineWidth = offset.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([]);
      
      parts.forEach(part => {
        if (part.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(part[0].x + offset.x, part[0].y + offset.y);
        
        for (let i = 1; i < part.length; i++) {
          ctx.lineTo(part[i].x + offset.x, part[i].y + offset.y);
        }
        
        if (closed) {
          ctx.closePath();
        }
        
        ctx.stroke();
      });
    });
    
    ctx.restore();
  },
  
  _drawArrows: function(layer) {
    const ctx = this._ctx;
    const parts = layer._parts;
    const options = layer.options;
    
    if (!parts.length) return;
    
    // Arrow configuration
    const arrowSize = Math.max(6, options.weight * 2);
    const arrowSpacing = 50; // pixels between arrows
    
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
        // The target point is on this segment
        const segmentProgress = (targetDistance - currentDistance) / segment.length;
        
        const x = segment.start.x + (segment.end.x - segment.start.x) * segmentProgress;
        const y = segment.start.y + (segment.end.y - segment.start.y) * segmentProgress;
        
        // Calculate angle based on segment direction
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
    
    // Draw arrow shape
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
/* 
// Enhanced styling function with canvas renderer support
export function getStyle(feature) {
  const type = feature.properties.displayrou;
  const isOneway = feature.properties.br_oneway === "Y";
  const status = feature.properties.status; // Get status from feature properties
    
  const styles = {
    "Protected Bike Lane":        { color: "#2547cf", weight: 4, dashArray: null },
    "Painted Lane, Large":        { color: "#e05b1d", weight: 3.5, dashArray: "4,8" },
    "Painted Lane":               { color: "#e05b1d", weight: 1.5, dashArray: "4,8" },
    "Chill Side Street":          { color: "#2547cf", weight: 2.5, dashArray: "4,4" },
    "Paved Trail":                { color: "#000080", weight: 4.5, dashArray: null },
    "Unpaved Trail":              { color: "#5A4B49", weight: 4.5, dashArray: null },
  };
  
  const baseStyle = styles[type] || { color: "#AAAAAA", weight: 1 };

  // Add arrow properties for one-way routes
  if (isOneway) {
    baseStyle.showArrows = true;
    console.log('Added showArrows to style'); // Debug line
  }

  // make less opaque if under construction
  if (status === 'under construction') {
    baseStyle.opacity = 0.5;
  }
  
  console.log('Final style:', baseStyle); // Debug line
  return baseStyle;
}

// Custom Canvas Renderer with Arrow Support
const ArrowRenderer = L.Canvas.extend({
  _updatePoly: function(layer, closed) {
    // Call the original _updatePoly method
    L.Canvas.prototype._updatePoly.call(this, layer, closed);
    
    // Add arrows if the layer has showArrows property
    if (layer.options.showArrows && !closed) {
      console.log('Drawing arrows for layer'); // Debug line
      this._drawArrows(layer);
    }
  },
  
  _drawArrows: function(layer) {
    const ctx = this._ctx;
    const parts = layer._parts;
    const options = layer.options;
    
    if (!parts.length) return;
    
    // Arrow configuration
    const arrowSize = Math.max(6, options.weight * 2);
    const arrowSpacing = 50; // pixels between arrows
    
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
        // The target point is on this segment
        const segmentProgress = (targetDistance - currentDistance) / segment.length;
        
        const x = segment.start.x + (segment.end.x - segment.start.x) * segmentProgress;
        const y = segment.start.y + (segment.end.y - segment.start.y) * segmentProgress;
        
        // Calculate angle based on segment direction
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
    
    // Draw arrow shape
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
*/
