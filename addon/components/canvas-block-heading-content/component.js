import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import Ember from 'ember';
import styles from './styles';

const { computed } = Ember;
const LEVEL_REG = /^(#{1,6})\s+(.*)$/;

/**
 * A component representing a "heading" type canvas block's content.
 *
 * @class CanvasEditor.CanvasBlockHeadingContentComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  classNames: ['canvas-block-heading-content'],
  localClassNames: ['canvas-block-heading-content'],
  styles,

  setBlockContentFromInput(content, preventRerender = true) {
    const match = content.match(LEVEL_REG);

    if (!match) {
      this._super(...arguments);
      return;
    }

    const oldLevel = this.get('block.meta.level');
    const newLevel = match[1].length;
    this._super(match[2], false);
    this.set('block.meta.level', newLevel);
    this.get('onBlockMetaReplacedLocally')(
      this.get('block'),
      ['level'],
      oldLevel,
      newLevel)
  }
});
