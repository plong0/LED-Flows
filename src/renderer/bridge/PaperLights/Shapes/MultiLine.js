import { Group, Path, Point } from 'paper';

function calculateAveragePoint (points = []) {
  if (!points.length) {
    return;
  }
  let average = { x: 0, y: 0 };
  let count = 0;
  for (let point of points) {
    average.x += point.x;
    average.y += point.y;
    count++;
  }
  average.x /= count;
  average.y /= count;
  return average;
}
function shiftObjectKeys (object, after, before, amount, callback) {
  const keys = Object.keys(object)
    .filter(value => {
      value = parseInt(value);
      return (value > after && (before < 0 || value < before));
    })
    .sort((a, b) => (amount < 0) ? (a - b) : (b - a));
  for (let key of keys) {
    object[parseInt(key) + amount] = object[key];
    if (typeof callback === 'function') {
      callback(key, object[key], amount);
    }
    object[key] = undefined;
    delete object[key];
  }
}

export default class MultiLine extends Group {
  constructor (config) {
    super(config);
    this.data.mainLine = null; // this is the primary line (standard paper.Path.Line)
    this.data.multiLines = new Group({ insert: false }); // this holds the extra "mutli" lines
    this.data.multiPoints = []; // holds all the line points
    this.data.multiPointLines = {}; // holds references to auxilary multiLines
    this.data.style = {};
    this.addChild(this.data.multiLines);

    // add custom method definitions
    this.addMultiPoint = (multiPoint, index = -1, stack = true) => {
      // sometimes it's nice to pass a single Point
      if (!Array.isArray(multiPoint)) {
        multiPoint = [ multiPoint ];
      }
      // make sure multiPoint cotains valid Point objects
      multiPoint = multiPoint.filter((value) => (
        value && !isNaN(value.x) && !isNaN(value.y) && value.x !== null && value.y !== null
      )).map((value) => {
        let point = new Point(value.x, value.y);
        if (value.data) {
          point.data = value.data;
        }
        return point;
      });
      if (!multiPoint.length) {
        // nothing left after validation
        return;
      }
      // offset the index
      index += this.getIndexOffset(index);
      // determine where to insert the point
      let addLinePoint = true; // track if it will be a new multiPoint, or append (stack) to an existing one
      if (index < 0) {
        // add new to end
        index = this.data.multiPoints.push(multiPoint) - 1;
      } else if (stack && index < this.data.multiPoints.length) {
        // stack at index
        this.data.multiPoints[index].push(...multiPoint);
        addLinePoint = false;
      } else {
        // insert new at index
        this.data.multiPoints.splice(index, 0, multiPoint);
        shiftObjectKeys(this.data.multiPointLines, index - 1, -1, 1, this.shiftSegmentIndex);
      }
      if (addLinePoint) {
        // creating a new multiPoint
        // make sure there is a mainLine
        if (this.data.multiPoints.length > 1 && !this.data.mainLine) {
          // create a new mainLine
          const p1 = this.data.multiPoints[0][0];
          const p2 = this.data.multiPoints[1][0];
          this.data.mainLine = new Path.Line({ from: p1, to: p2, insert: false });
          this.addChild(this.data.mainLine);
          this.data.mainLine.data = { ...this.data.data };
          this.data.mainLine.style = this.data.style;
        } else if (this.data.mainLine) {
          // existing mainLine, add the first entry from multiPoint to it
          if (index < 0) {
            // unlikely case because index is set above with multiPoints.push(...) - 1
            this.data.mainLine.add(multiPoint[0]);
          } else {
            this.data.mainLine.insert(index, multiPoint[0]);
          }
        }
      }
      // check multi-connection before index
      index = this.checkMultiPoint(index, -1);
      // check the multi-connection after index
      index = this.checkMultiPoint(index, 1);
    };
    this.checkMultiPoint = (index, direction) => {
      if (!direction || !this.data.multiPoints.length) {
        return;
      }
      if (index >= this.data.multiPoints.length - 1 && this.data.multiPoints[this.data.multiPoints.length - 1].constructor.name === 'Point') {
        this.data.multiPoints.splice(this.data.multiPoints.length - 1, 1);
        this.data.mainLine.removeSegment(this.data.multiPoints.length);
        this.checkMultiPointLines(this.data.multiPoints.length - 1, 1);
        this.checkMultiPointLines(this.data.multiPoints.length - 1, -1);
        return;
      }
      // direction < 0 checks before index
      // direction > 0 checks after index
      direction = (direction < 0 ? -1 : 1); // ensure always a factor of 1
      let nextIndex = index + direction;
      if (index >= 0 && index < this.data.multiPoints.length && nextIndex >= 0 && nextIndex < this.data.multiPoints.length) {
        const multiPoint1 = this.data.multiPoints[index];
        const nextPoint = this.data.multiPoints[nextIndex];
        let multiPoint2 = nextPoint;
        // nextPoint could be a multiPoint or a multiJoinPoint
        // if it is a multiPoint, this function will create a new multiJoinPoint
        // if it is a multiJoinPoint, this function will refresh it
        // multiPoint2 should always be the next multiPoint
        if (!Array.isArray(multiPoint2)) {
          // multiPoint2 === nextPoint is already a multiJoinPoint
          // skip over it so multiPoint2 is the next multiPoint
          nextIndex += direction;
          if (nextIndex >= 0 && nextIndex < this.data.multiPoints.length) {
            multiPoint2 = this.data.multiPoints[nextIndex];
          }
        }
        // check if it is consecutive multi-entry multiPoints
        if (Array.isArray(multiPoint1) && Array.isArray(multiPoint2)) {
          if (multiPoint1.length > 1 && multiPoint2.length > 1) {
            // calculate an average point to connect each side to (meet at a single mid-point)
            const multiJoinPoint = new Point(calculateAveragePoint([ calculateAveragePoint(multiPoint1), calculateAveragePoint(multiPoint2) ]));
            if (Array.isArray(nextPoint)) {
              // next point is also a multi-point
              // insert a new multi-joint-point to connect them
              this.data.multiPoints.splice(index + (direction > 0 ? 1 : 0), 0, multiJoinPoint);
              this.data.mainLine.insert(index + (direction > 0 ? 1 : 0), multiJoinPoint);
              if (direction < 0) {
                // added before index (but after nextIndex)
                shiftObjectKeys(this.data.multiPointLines, index - 1, -1, 1, this.shiftSegmentIndex);
                index++;
              } else {
                // added after index (but before nextIndex)
                shiftObjectKeys(this.data.multiPointLines, index, -1, 1, this.shiftSegmentIndex);
                nextIndex++;
              }
            } else if (nextPoint.constructor.name === 'Point') {
              // next point is a multi-joint-point
              // refresh it with new average point
              nextPoint.set(multiJoinPoint);
              this.data.mainLine.segments[(index + direction)].point.set(multiJoinPoint);
            }
          } else if ((multiPoint1.length <= 1 || multiPoint2.length <= 1) && nextPoint.constructor.name === 'Point') {
            this.data.multiPoints.splice(index + direction, 1);
            this.data.mainLine.removeSegment(index + direction);
            if (direction < 0) {
              shiftObjectKeys(this.data.multiPointLines, index - 1, -1, -1, this.shiftSegmentIndex);
              index--;
            } else {
              shiftObjectKeys(this.data.multiPointLines, index, -1, -1, this.shiftSegmentIndex);
              nextIndex--;
            }
          }
        }
      }
      // refresh multi-point lines from lower point to upper point
      this.checkMultiPointLines((direction < 0 ? nextIndex : index), 1);
      // refresh multi-point lines to upper point from lower point
      this.checkMultiPointLines((direction < 0 ? index : nextIndex), -1);
      return index;
    };
    this.checkMultiPointLines = (index, direction) => {
      // direction < 0 handles multiPointLines coming to the multiPoint
      // direction > 0 handles multiPointLines going from the multiPoint
      direction = (direction < 0 ? -1 : 1); // ensure always a factor of 1
      const slot = (direction < 0 ? 'to' : 'from'); // choose which of the 2 sets
      let nextIndex = index + direction;
      if (((index === 0 && direction < 0) || (index === this.data.multiPoints.length - 1 && direction > 0)) && this.data.multiPointLines[index]) {
        const removedLines = this.data.multiPointLines[index][slot].splice(0, this.data.multiPointLines[index][slot].length);
        for (let removedLine of removedLines) {
          removedLine.remove();
        }
      }
      if (index >= 0 && index < this.data.multiPoints.length && nextIndex >= 0 && nextIndex < this.data.multiPoints.length) {
        // select the points
        const multiPoint = this.data.multiPoints[index];
        let nextPoint = this.data.multiPoints[nextIndex];
        // nextPoint will be a single-entry multi-point (Array) or a multi-joint-point (Point object)
        if (Array.isArray(nextPoint) && nextPoint.length) {
          // nextPoint is a single-entry multi-point, choose the point
          nextPoint = nextPoint[0];
        }
        // is there more than one multiPoint entry and a point to connect them to?
        // a multiPoint with one entry is already handled by the mainLine
        if (Array.isArray(multiPoint) && multiPoint.length) {
          if (this.data.multiPointLines[index] && this.data.multiPointLines[index][slot].length > multiPoint.length - 1) {
            const extraLineCount = this.data.multiPointLines[index][slot].length - multiPoint.length + 1;
            const removedLines = this.data.multiPointLines[index][slot].splice(-extraLineCount, extraLineCount);
            for (let removedLine of removedLines) {
              removedLine.remove();
            }
          }
          if (multiPoint.length > 1 && nextPoint && nextPoint.constructor.name === 'Point') {
            // a fast reference to the multiPointLines (make sure index stays in sync!)
            if (!this.data.multiPointLines[index]) {
              this.data.multiPointLines[index] = {
                to: [],
                from: []
              };
            }
            // make multiPointLines linking each multiPoint entry to the nextPoint
            // (multiPoint[0] is on the mainLine so it is skipped)
            for (let i = 1; i < multiPoint.length; i++) {
              // direction < 0 draws the line: nextPoint -> multiPoint
              // direction > 0 draws the line: multiPoint -> nextPoint
              const point1 = (direction < 0) ? nextPoint : multiPoint[i];
              const point2 = (direction < 0) ? multiPoint[i] : nextPoint;
              if (i > this.data.multiPointLines[index][slot].length) {
                // not enough multiPointLines, make a new one
                const multiLine = new Path.Line({
                  from: point1,
                  to: point2
                });
                multiLine.data = {
                  ...this.data.data,
                  multiSegment: index - (direction < 0 ? this.getIndexOffset(index) : 0),
                  multiIndex: i,
                  segmentIndex: index - (direction < 0 ? 1 : 0)
                };
                this.data.multiPointLines[index][slot].push(multiLine);
                this.data.multiLines.addChild(multiLine);
                multiLine.style = this.data.style;
              } else {
                // refresh an existing multiPointLine
                const multiLine = this.data.multiPointLines[index][slot][i - 1];
                multiLine.segments[0].point.set(point1);
                multiLine.segments[1].point.set(point2);
              }
            }
          }
        }
      }
    };
    this.getIndexOffset = (index, absolute = false) => {
      // set absolute = true to include auto-genereated points in given index (ex. when cross-referencing line segments)
      if (index >= 0) {
        // count how many multiJoinPoints there are on the line before index
        // this allows caller to interact using indexes of only the points it inserts
        // (caller can safely ignore any auto-generated connection points)
        let indexOffset = 0;
        for (let i = 0; i < this.data.multiPoints.length && i <= index + (absolute ? 0 : indexOffset); i++) {
          if (this.data.multiPoints[i].constructor.name === 'Point') {
            indexOffset++;
          }
        }
        return indexOffset;
      }
      return 0;
    };
    this.getSegmentPointIndex = (segmentIndex) => {
      // retrieve multi-point index associated with given segmentIndex
      return (segmentIndex - this.getIndexOffset(segmentIndex, true));
    };
    this.refreshChildValues = (key, object) => {
      let updateItems = [];
      if (this.data.mainLine) {
        updateItems.push(this.data.mainLine);
      }
      for (let index in this.data.multiPointLines) {
        updateItems.push(
          ...this.data.multiPointLines[index]['to'],
          ...this.data.multiPointLines[index]['from']
        );
      }
      for (let item of updateItems) {
        if (item && typeof item === 'object' && typeof item[key] === 'object') {
          for (let prop in object) {
            item[key][prop] = object[prop];
          }
        }
      }
    };
    this.removeMultiPoint = (index, multiIndex) => {
      // localize index (accounts for auto-injected points)
      index += this.getIndexOffset(index);
      if (index >= 0 && index < this.data.multiPoints.length) {
        // look up the multiPoint entry
        let multiPoint = this.data.multiPoints[index];
        if (Array.isArray(multiPoint) && multiIndex >= 0 && multiIndex < multiPoint.length) {
          // remove the multiPoint entry
          multiPoint.splice(multiIndex, 1);
          // update the mainLine
          if (multiIndex === 0 && this.data.mainLine && this.data.mainLine.segments.length && index < this.data.mainLine.segments.length) {
            this.data.mainLine.removeSegment(index);
            if (multiPoint.length) {
              this.data.mainLine.insert(index, multiPoint[0]);
            }
          }
          if (!multiPoint.length) {
            this.data.multiPoints.splice(index, 1);
            shiftObjectKeys(this.data.multiPointLines, index, -1, -1, this.shiftSegmentIndex);
            if (index > 0) {
              index--;
            }
          }
          // update the multiPointLines
          // check multi-connection before next index
          index = this.checkMultiPoint(index, -1);
          // check the multi-connection after previous index
          index = this.checkMultiPoint(index, 1);
        }
      }
    };
    this.setData = (data) => {
      // data gets assigned to the items that make up the MultiLine
      this.data.data = data;
      this.refreshChildValues('data', this.data.data);
    };
    this.setMultiPoint = (index, multiIndex, point) => {
      // localize index (accounts for auto-injected points)
      index += this.getIndexOffset(index);
      if (index >= 0 && index < this.data.multiPoints.length) {
        // look up the multiPoint entry
        let multiPoint = this.data.multiPoints[index];
        if (Array.isArray(multiPoint) && multiIndex >= 0 && multiIndex < multiPoint.length) {
          // update the multiPoint entry
          multiPoint[multiIndex].set(point);
          // update the mainLine
          if (multiIndex === 0 && this.data.mainLine && this.data.mainLine.segments.length && index < this.data.mainLine.segments.length) {
            this.data.mainLine.segments[index].point.set(point);
          }
          // update the multiPointLines
          // check multi-connection before index
          index = this.checkMultiPoint(index, -1);
          // check the multi-connection after index
          index = this.checkMultiPoint(index, 1);
        }
      }
    };
    this.setStyle = (style) => {
      // save it in data.style to be applied to future children
      for (let prop in style) {
        this.data.style[prop] = style[prop];
      }
      // paper.js automatically applies it to any existing children
      this.style = style;
    };
    this.shiftPoints = (from, to, count) => {
      if (to === from) {
        return;
      }
      const forward = (to > from);
      const fromOffset = this.getIndexOffset(from);
      from += fromOffset;
      let length = 0;
      let counted = 0;
      for (let i = from; i < this.data.multiPoints.length; i++) {
        length++;
        if (Array.isArray(this.data.multiPoints[i])) {
          counted++;
        }
        if (counted >= count) {
          break;
        }
      }
      const toOffset = this.getIndexOffset(to + length);
      let mplClone = {};
      for (let key in this.data.multiPointLines) {
        mplClone[key] = {
          from: [...this.data.multiPointLines[key].from],
          to: [...this.data.multiPointLines[key].to]
        };
      }
      // remove from multiPoints
      const multiPoints = this.data.multiPoints.splice(from, length);
      // removeSegments from mainLine
      let mainSegments;
      if (this.data.mainLine) {
        mainSegments = this.data.mainLine.removeSegments(from, from + length);
      }
      // collect multiPointLines that are being shifted
      let multiPointLines = {};
      for (let i = from; i < from + length; i++) {
        if (this.data.multiPointLines[i]) {
          multiPointLines[i] = this.data.multiPointLines[i];
          this.data.multiPointLines[i] = undefined;
          delete this.data.multiPointLines[i];
        }
      }
      if (from < this.data.multiPoints.length && this.data.multiPoints[from].constructor.name === 'Point') {
        // remove the multiJoinPoint from multiPoints and mainLine
        this.data.multiPoints.splice(from, 1);
        if (this.data.mainLine) {
          this.data.mainLine.removeSegment(from);
        }
        // keep multiPointLines keys synchronized with multiPoints
        shiftObjectKeys(this.data.multiPointLines, from - 1, -1, -1, this.shiftSegmentIndex);
      }
      // shift keys of multiPointLines between from and to
      if (forward) {
        // temporarily shift multiPointLines keys to check points
        shiftObjectKeys(this.data.multiPointLines, from, to + toOffset + length + 1, -length, this.shiftSegmentIndex);
        // check multiPoints that point at from would have touched
        this.checkMultiPoint(from, -1);
        if (length > 1) {
          this.checkMultiPoint(from + length - 1, -1);
        }
        // find absolute index to insert to
        to += this.getIndexOffset(to);
        // shift the multiPointLines keys back to allow room for shifted multiPointLines to be inserted
        shiftObjectKeys(this.data.multiPointLines, to - 1, to + length, length, this.shiftSegmentIndex);
      } else {
        // temporarily shift multiPointLines keys to check points
        shiftObjectKeys(this.data.multiPointLines, from - 1, from + length + 1, -length, this.shiftSegmentIndex);
        // check multiPoints that point at from would have touched
        this.checkMultiPoint(from, -1);
        // find absolute index to insert to
        to += this.getIndexOffset(to);
        // shift the multiPointLines keys back to allow room for shifted multiPointLines to be inserted
        shiftObjectKeys(this.data.multiPointLines, to - 1, from + length, length, this.shiftSegmentIndex);
      }
      // the multiPoints have been removed and multiPointLines cleaned up
      // the line is at a state where everything is correct except it does not have the shifted points
      // time to re-insert the shifted points
      if (to > this.data.multiPoints.length) {
        to = this.data.multiPoints.length;
      }
      // insert into multiPoints
      this.data.multiPoints.splice(to, 0, ...multiPoints);
      // insertSegments to mainLine
      if (this.data.mainLine && mainSegments) {
        this.data.mainLine.insertSegments(to, mainSegments);
      }
      // re-insert (recycle) multiPointLines with shifted index
      for (let key in multiPointLines) {
        const amount = (to - from);
        const newKey = parseInt(key) + amount;
        this.shiftSegmentIndex(key, multiPointLines[key], amount);
        this.data.multiPointLines[newKey] = multiPointLines[key];
      }
      // update the multi-points
      to = this.checkMultiPoint(to, -1);
      this.checkMultiPoint(to + length - 1, 1);
    };
    this.shiftSegmentIndex = (pointIndex, items, amount) => {
      if (!amount) {
        return;
      }
      const newIndex = parseInt(pointIndex) + amount;
      if (items.from) {
        for (let item of items.from) {
          if (item && item.data && item.data.hasOwnProperty('segmentIndex')) {
            item.data.multiSegment = newIndex;
            item.data.segmentIndex += amount;
          }
        }
      }
      if (items.to) {
        for (let item of items.to) {
          if (item && item.data && item.data.hasOwnProperty('segmentIndex')) {
            item.data.multiSegment = newIndex;
            item.data.segmentIndex += amount;
          }
        }
      }
    };
  }
}
