const canvasBlockClass = 'canvas-block';
/**
 * Captures and restores the user's selection state inside of the editor.
 *
 * @class CanvasEditor.SelectionState
 */
export default class SelectionState {
  /**
   * Create a new selection state for a given `element`.
   *
   * @param {HTMLElement} element The element to track selection state inside of
   */
  constructor(element) {
    /**
     * @member {HTMLElement} The element to track selection state inside of
     */
    this.element = element;

    /**
     * @member {?number} The index at which the selection starts
     */
    this.start = null;

    /**
     * @member {?number} The index at which the selection ends
     */
    this.end = null;
  }

  /**
   * Captures the current state of the selection.
   *
   * @return {SelectionState} this
   */
  capture() {
    const { anchorNode, anchorOffset, focusNode, focusOffset } =
      window.getSelection();

    if (!anchorNode || !focusNode) {
      this.reset();
      return { start: this.start, end: this.end };
    }

    this.start = this.lengthIncluding(anchorNode, anchorOffset);
    this.end = this.lengthIncluding(focusNode, focusOffset);

    return this;
  }

  /**
   * Offset the selection state by `start` and `end` values. If only a single
   * value is provided, the entire selection is offset.
   *
   * @param {number} start The start offset
   * @param {number} [end=start] The end offset
   * @return {SelectionState} this
   */
  offset(start, end = start) {
    this.start += start;
    this.end += end;
    return this;
  }

  /**
   * Reset the `start` and `end` properties.
   */
  reset() {
    this.start = null;
    this.end = null;
  }

  /**
   * Restore the selection state.
   *
   * @return {SelectionState} this
   */
  restore() {
    this.element.focus();

    let { start, end } = this;
    if (start > end) [start, end] = [end, start];

    const restorationRange = document.createRange();
    const iterator = this.getNodeIterator(this.element);

    let didSetStart, didSetEnd;
    let position = 0;
    let node;

    while ((node = iterator.nextNode())) {
      if (didSetStart && didSetEnd) break;

      const nodeLength = this.nodeLength(node);
      const isText = node.nodeType === Node.TEXT_NODE;

      if (!didSetStart && start <= position + nodeLength) {
        if (isText) {
          restorationRange.setStart(node, start - position);
        } else {
          restorationRange.setStart(node.parentNode, this.indexOfNode(node));
        }

        didSetStart = true;
      }

      if (!didSetEnd && end <= position + nodeLength) {
        if (isText) {
          restorationRange.setEnd(node, end - position);
        } else {
          restorationRange.setEnd(node.parentNode, this.indexOfNode(node));
        }

        didSetEnd = true;
      }

      position += nodeLength;
    }

    const selection = window.getSelection();
    selection.removeAllRanges();

    if (this.start > this.end) {
      let { startContainer, startOffset } = restorationRange;
      restorationRange.collapse(false);
      selection.addRange(restorationRange);
      selection.extend(startContainer, startOffset);
    } else {
      selection.addRange(restorationRange);
    }

    return this;
  }

  /**
   * Get an object that iterates through the given `node`.
   *
   * @private
   * @param {Node} iteratee The node to iterate through
   * @return {NodeIterator} A node iterator for `node`
   */
  getNodeIterator(iteratee) {
    return document.createNodeIterator(
      iteratee,
      NodeFilter.SHOW_ALL,
      function onNode(node) {
        if (node === iteratee) {
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    );
  }

  /**
   * Get the index of `node` in its parent.
   *
   * @private
   * @param {Node} node The node to get the index of
   * @return {number} The index of `node` in its parent
   */
  indexOfNode(node) {
    let index = 0;

    while ((node = node.previousSibling)) {
      index++;
    }

    return index;
  }

  /**
   * Get the length up to and including the given node and offset.
   *
   * @private
   * @param {Node} node The node to measure up until
   * @param {number} offset The offset of the selection
   * @return {number} The length up to and including the node and offset
   */
  lengthIncluding(node, offset) {
    if (node.nodeType === Node.TEXT_NODE) {
      return this.lengthUntil(node) + offset;
    } else if (offset > 0) {
      const child = node.childNodes[offset - 1];
      return this.lengthUntil(child) + this.nodeLength(child, true);
    }
    return this.lengthUntil(node);
  }

  /**
   * Get the length until the given node.
   *
   * @private
   * @param {Node} testNode The node to measure up until
   * @return {number} The length up to the node
   */
  lengthUntil(testNode) {
    let length = 0;
    const iterator = this.getNodeIterator(this.element);
    let node;

    while ((node = iterator.nextNode())) {
      if (node === testNode) break;
      length += this.nodeLength(node);
    }

    return length;
  }

  /**
   * Get the length of the given `node`, and optionally recurse through its
   * blocks.
   *
   * @private
   * @param {Node} node The node to get the length of
   * @param {Boolean} [recurse=false] Whether to get the length recursively by
   *   adding up the length of all children
   * @return {number} The length of `node`
   */
  nodeLength(node, recurse = false) {
    if (recurse && node.childNodes.length > 0) {
      const iterator = this.getNodeIterator(node);

      let innerLength = 0;
      let childNode;

      while ((childNode = iterator.nextNode())) {
        innerLength += this.nodeLength(childNode, recurse);
      }

      return innerLength;
    }

    const characterNodes = ['BR', 'HR', 'IMG'];

    if (node.nodeType === Node.TEXT_NODE) {
      return node.data.length;
    } else if (node.classList.contains(canvasBlockClass)) {
      return 1;
    } else if (characterNodes.indexOf(node.nodeName) > -1) {
      return 1;
    }
    return 0;
  }
}
