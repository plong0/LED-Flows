import { Tool } from 'paper';

export default class PaperLightTool extends Tool {
  constructor (paperLights) {
    super();
    this.$PL = paperLights;
    this.active = false;
    this.params = {};
    this.pressedKeys = [];
    this.baseEvents = {
      onActivate: (event) => {
        this.active = true;
      },
      onDeactivate: (event) => {
        this.active = false;
      },
      onKeyDown: (event) => {
        if (event.key && !this.pressedKeys.includes(event.key)) {
          this.pressedKeys.push(event.key);
        }
      },
      onKeyUp: (event) => {
        const pressedIndex = (event.key ? this.pressedKeys.indexOf(event.key) : -1);
        if (pressedIndex !== -1) {
          this.pressedKeys.splice(pressedIndex, 1);
        }
        if (event.key === 'escape') {
          this.deactivate();
          return true;
        }
      },
      onMouseUp: (event) => {
        if (event.event.button === 2) {
          this.deactivate();
        }
      }
    };
    this.validEventTypes = [
      'onActivate',
      'onDeactivate',
      'onMouseDown',
      'onMouseDrag',
      'onMouseMove',
      'onMouseUp',
      'onKeyDown',
      'onKeyUp'
    ];
    this.bindEvents(this.baseEvents);
  }
  bindEvents (handlers) {
    for (let eventType in handlers) {
      const handler = handlers[eventType];
      if (this.validEventTypes.includes(eventType) && typeof handler === 'function') {
        this[eventType] = handler;
      }
    }
  }
  deactivate () {
    if (this.$PL) {
      this.$PL.activateTool();
    }
  }
  isActive () {
    return this.active;
  }
  setParams (params) {
    this.params = params;
  }
}
