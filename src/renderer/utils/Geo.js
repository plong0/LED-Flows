const Geo = {
  isNumber (value) {
    // source: https://codepen.io/grok/pen/LvOQbW
    return (typeof value === 'number' && value === Number(value) && Number.isFinite(value));
  },
  isPoint (p) {
    return (typeof p === 'object' && p.hasOwnProperty('x') && p.hasOwnProperty('y') && this.isNumber(p.x) && this.isNumber(p.y));
  },
  addToPoint (p, v) {
    const angle = this.convertDegToRad(v.angle);
    const p2 = {
      x: p.x + v.distance * Math.cos(angle),
      y: p.y + v.distance * Math.sin(angle)
    };
    return p2;
  },
  calculateAngle (p1, p2) {
    if (!this.isPoint(p1) || !this.isPoint(p2)) {
      return undefined;
    }
    const radians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    return this.convertRadToDeg(radians);
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
  convertDegToRad (angle) {
    return (angle * (Math.PI / 180.0));
  },
  convertRadToDeg (radians) {
    return (radians * (180.0 / Math.PI));
  },
  rotatePoint (point, angle, anchor) {
    const radians = this.convertDegToRad(angle);
    const cosA = Math.cos(radians);
    const sinA = Math.sin(radians);
    const x = point.x - anchor.x;
    const y = point.y - anchor.y;
    const point2 = {
      x: (x * cosA) - (y * sinA),
      y: (x * sinA) + (y * cosA)
    };
    return point2;
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
