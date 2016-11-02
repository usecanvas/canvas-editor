export function caretRangeFromPoint(x, y) {
  let range;
  if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(x, y);

    if (position) {
      range = document.createRange();
      range.setStart(position.offsetNode, position.offset);
    }
  } else if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
  }
  return range;
}
