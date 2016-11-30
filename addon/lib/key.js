const isWindows = (/^win/i).test(navigator.platform);

const KEY_NAMES = {
  8: 'backspace',
  9: 'tab',
  13: 'return',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  27: 'esc',
  32: 'space',

  // Arrow keys
  37: 'left', 38: 'up', 39: 'right', 40: 'down',

  46: 'delete',

  // Number keys
  48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7',
  56: '8', 57: '9',

  // Plain alphabet keys
  65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f', 71: 'g', 72: 'h',
  73: 'i', 74: 'j', 75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o', 80: 'p',
  81: 'q', 82: 'r', 83: 's', 84: 't', 85: 'u', 86: 'v', 87: 'w', 88: 'x',
  89: 'y', 90: 'z',

  91: 'meta',
  93: 'meta',
  191: 'slash'
};

const KEY_CODES = {};

for (const code in KEY_NAMES) {
  if (KEY_NAMES.hasOwnProperty(code)) {
    const value = KEY_NAMES[code];
    KEY_CODES[value] = parseInt(code, 10);
  }
}

export default class Key {
  constructor(event) {
    this.event      = event;
    this.components = [];

    if (this.meta) {
      this.components.push('meta');
    }

    if (this.ctrl) {
      this.components.push('ctrl');
    }

    if (this.alt) {
      this.components.push('alt');
    }

    if (this.shift) {
      this.components.push('shift');
    }

    this.components.push(this.key);
  }

  has(...components) {
    return this.hasAll(...components);
  }

  hasAll(...components) {
    for (const component of components) {
      if (this.components.indexOf(component) === -1) {
        return false;
      }
    }

    return true;
  }

  hasNot(...components) {
    for (const component of components) {
      if (this.components.indexOf(component) > -1) {
        return false;
      }
    }

    return true;
  }

  hasOne(...components) {
    for (const component of components) {
      if (this.components.indexOf(component) > -1) {
        return true;
      }
    }

    return false;
  }

  in(...componentSets) {
    for (const componentSet of componentSets) {
      if (this.is(...componentSet)) {
        return true;
      }
    }

    return false;
  }

  is(...components) {
    if (components.length !== this.components.length) {
      return false;
    }

    for (const component of components) {
      if (this.components.indexOf(component) === -1) {
        return false;
      }
    }

    return true;
  }

  toString() {
    return this.components.join('+');
  }

  get key() {
    return KEY_NAMES[this.event.keyCode];
  }

  /*
   * MODIFIERS
   * =========
   */
  get alt() {
    return this.event.altKey;
  }

  get cmd() {
    return this.meta;
  }

  get ctrl() {
    return this.event.ctrlKey;
  }

  get meta() {
    return isWindows ? this.ctrl : this.event.metaKey;
  }

  get option() {
    return this.alt;
  }

  get shift() {
    return this.event.shiftKey;
  }

  /*
   * META INFORMATION
   * ================
   */
  get isArrow() {
    return this.hasOne('left', 'up', 'right', 'down');
  }

  get isDelete() {
    return this.isDeleteLeft || this.isDeleteRight;
  }

  get isDeleteLeft() {
    return this.isDeleteLeftCharacter ||
      this.isDeleteLeftWord ||
      this.isDeleteLeftLine;
  }

  get isDeleteLeftCharacter() {
    return this.has('backspace') && !this.meta && !this.alt ||
      this.is('ctrl', 'h');
  }

  get isDeleteLeftLine() {
    return this.meta && this.has('backspace');
  }

  get isDeleteLeftWord() {
    return this.alt && this.has('backspace');
  }

  get isDeleteRight() {
    return this.isDeleteRightCharacter ||
      this.isDeleteRightWord ||
      this.isDeleteRightLine;
  }

  get isDeleteRightCharacter() {
    return this.has('delete') && !this.meta && !this.alt ||
      this.is('ctrl', 'd');
  }

  get isDeleteRightLine() {
    return this.meta && this.has('delete') ||
      this.ctrl && this.has('k');
  }

  get isDeleteRightWord() {
    return this.alt && this.has('delete');
  }

  get isFormatting() {
    return this.meta &&
      !this.alt &&
      !this.ctrl &&
      this.hasOne('b', 'i', 'u');
  }

  get isNavigation() {
    return this.isArrow && !this.has('ctrl') ||
      this.has('ctrl', 'n') ||
      this.has('ctrl', 'p');
  }

  get isNavigateHorizontal() {
    return this.isNavigation && (
      this.has('left') ||
      this.has('right')
    );
  }

  get isNavigateBackward() {
    return this.isNavigateLeftCharacter ||
      this.isNavigateLeftWord ||
      this.isNavigateLeftLine ||
      this.isNavigateUpLine ||
      this.isNavigateUpParagraph ||
      this.isNavigateUpDocument;
  }

  get isNavigateForward() {
    return this.isNavigateRightCharacter ||
      this.isNavigateRightWord ||
      this.isNavigateRightLine ||
      this.isNavigateDownLine ||
      this.isNavigateDownParagraph ||
      this.isNavigateDownDocument;
  }

  get isNavigateLeftCharacter() {
    return this.isNavigation &&
      !this.meta &&
      !this.alt &&
      this.has('left');
  }

  get isNavigateRightCharacter() {
    return this.isNavigation &&
      !this.meta &&
      !this.alt &&
      this.has('right');
  }

  get isNavigateLeftWord() {
    return this.isNavigation &&
      !this.meta &&
      this.alt &&
      this.has('left');
  }

  get isNavigateRightWord() {
    return this.isNavigation &&
      !this.meta &&
      this.alt &&
      this.has('right');
  }

  get isNavigateLeftLine() {
    return this.isNavigation &&
      this.meta &&
      this.has('left');
  }

  get isNavigateRightLine() {
    return this.isNavigation &&
      this.meta &&
      this.has('right');
  }

  get isNavigateVertical() {
    return this.isNavigation && (
      this.has('up') ||
      this.has('down') ||
      this.has('ctrl', 'p') ||
      this.has('ctrl', 'n')
    );
  }

  get isNavigateUpLine() {
    return this.isNavigation &&
      !this.meta &&
      !this.alt && (
        this.has('up') ||
        this.has('ctrl', 'p')
      );
  }

  get isNavigateDownLine() {
    return this.isNavigation &&
      !this.meta &&
      !this.alt && (
        this.has('down') ||
        this.has('ctrl', 'n')
      );
  }

  get isNavigateUpParagraph() {
    return this.isNavigation &&
      !this.meta &&
      this.alt &&
      this.has('up');
  }

  get isNavigateDownParagraph() {
    return this.isNavigation &&
      !this.meta &&
      this.alt &&
      this.has('down');
  }

  get isNavigateUpDocument() {
    return this.isNavigation &&
      this.meta &&
      this.has('up');
  }

  get isNavigateDownDocument() {
    return this.isNavigation &&
      this.meta &&
      this.has('down');
  }

  get isNewLine() {
    return this.has('return') ||
      this.is('ctrl', 'm') ||
      !isWindows && this.is('ctrl', 'j');
  }

  get navigationArguments() {
    if (!this.isNavigation) {
      return null;
    }

    const type = this.shift ? 'extend' : 'move';

    if (this.isNavigateLeftCharacter) {
      return [type, 'backward', 'character'];
    } else if (this.isNavigateRightCharacter) {
      return [type, 'forward', 'character'];
    } else if (this.isNavigateLeftWord) {
      return [type, 'backward', 'word'];
    } else if (this.isNavigateRightWord) {
      return [type, 'forward', 'word'];
    } else if (this.isNavigateLeftLine) {
      return [type, 'backward', 'lineboundary'];
    } else if (this.isNavigateRightLine) {
      return [type, 'forward', 'lineboundary'];
    } else if (this.isNavigateUpLine) {
      return [type, 'backward', 'line'];
    } else if (this.isNavigateDownLine) {
      return [type, 'forward', 'line'];
    } else if (this.isNavigateUpParagraph) {
      return [type, 'backward', 'paragraph'];
    } else if (this.isNavigateDownParagraph) {
      return [type, 'forward', 'paragraph'];
    } else if (this.isNavigateUpDocument) {
      return [type, 'backward', 'documentboundary'];
    } else if (this.isNavigateDownDocument) {
      return [type, 'forward', 'documentboundary'];
    }
    return null;
  }

  static get KEY_NAMES() {
    return KEY_NAMES;
  }

  static get KEY_CODES() {
    return KEY_CODES;
  }
}
