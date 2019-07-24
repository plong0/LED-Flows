const Geo = {
  isNumber (value) {
    // source: https://codepen.io/grok/pen/LvOQbW
    return (typeof value === 'number' && value === Number(value) && Number.isFinite(value));
  },
  isPoint (p) {
    return (typeof p === 'object' && p.hasOwnProperty('x') && p.hasOwnProperty('y') && this.isNumber(p.x) && this.isNumber(p.y));
  },
  addToPoint (p, v) {
    const p2 = {
      x: p.x + v.distance * Math.cos(v.angle),
      y: p.y + v.distance * Math.sin(v.angle)
    };
    return p2;
  },
  calculateAngle (p1, p2) {
    if (!this.isPoint(p1) || !this.isPoint(p2)) {
      return undefined;
    }
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
  },
  calculateDistance (p1, p2) {
    if (!this.isPoint(p1) || !this.isPoint(p2)) {
      return undefined;
    }
    // shoutouts to the OG Pythagoras!
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
  round (value, rounding) {
    if (!this.isNumber(value)) {
      return value;
    }
    if (rounding === true) {
      // round to nearest integer
      return Math.round(value);
    } else if (Number.isInteger(rounding)) {
      // round to fixed number of decimal places
      // source: http://www.jacklmoore.com/notes/rounding-in-javascript/
      return Number(Math.round(`${value}e${rounding}`) + `e-${rounding}`);
    }
    // no rounding, return value as is
    return value;
  }
};
export default Geo;
