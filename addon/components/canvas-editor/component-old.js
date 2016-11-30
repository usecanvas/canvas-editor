import Ember from 'ember';
import MultiBlockSelect from 'canvas-editor/lib/multi-block-select';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import nsEvent from 'canvas-editor/lib/ns-event';

const { on, run } = Ember;

/**
 * A component that allows for the editing of a canvas in realtime.
 *
 * @class CanvasEditor.CanvasEditorComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  bindMultiBlockVariants: on('didInsertElement', function() {
    const self = this;

    // Bind a document-level event to this component
    function documentBind(evtName) {
      Ember.$(document).on(nsEvent(evtName, self),
        multiBlockWrap(self[`multiBlock${evtName.capitalize()}`].bind(self)));
    }

    // Return a function that executes a function only if `isMultiBlock`
    function multiBlockWrap(func) {
      return function _multiBlockWrapped(evt) {
        if (self.get('isMultiBlock')) return func(evt);
        return null;
      };
    }

    ['copy',
     'cut',
     'keydown',
     'keypress',
     'paste'].forEach(evtName => documentBind(evtName));
  }),

  unbindMultiBlockVariants: on('willDestroyElement', function() {
    ['copy',
     'cut',
     'keydown',
     'keypress',
     'paste'].forEach(evtName => {
       Ember.$(document).off(nsEvent(evtName, this));
     });
  }),

  /* eslint-disable no-console */
  multiBlockKeydown(evt) {
    let focusBlock;

    switch (evt.key || evt.keyCode) {
      case 'Escape':
      case 27:
        focusBlock =
          this.getNavigableBlocks().filterBy('isSelected').objectAt(0);
        this.get('multiBlockSelect').deSelectAll();
        run.scheduleOnce('afterRender', this, 'focusBlockEnd', focusBlock);
    }
  },

  multiBlockKeypress(evt) {
    const content = evt.char || String.fromCharCode(evt.charCode);

    let focusBlock;

    this.getNavigableBlocks().filterBy('isSelected').forEach(
      (replacedBlock, i) => {
        if (i === 0) {
          if (replacedBlock.get('type') === 'title') {
            replacedBlock.set('oldContent', replacedBlock.get('content'));
            replacedBlock.set('content', content);
            this.send('blockContentUpdatedLocally', replacedBlock);
            focusBlock = replacedBlock;
          } else if (replacedBlock.get('parent')) {
            focusBlock = this.splitGroupAtMember(replacedBlock, content);
          } else {
            const paragraph = Paragraph.create({ content });
            this.send('blockReplacedLocally', replacedBlock, paragraph);
            focusBlock = paragraph;
          }
        } else {
          this.send('blockDeletedLocally',
            replacedBlock, '', { onlySelf: true });
        }
      });

    this.get('multiBlockSelect').deSelectAll();
    run.scheduleOnce('afterRender', this, 'focusBlockEnd', focusBlock);
  },

  multiBlockCut(_evt) {
    console.log('cut');
  },

  multiBlockCopy(_evt) {
    console.log('copy');
  },

  multiBlockPaste(_evt) {
    console.log('paste');
  },
  /* eslint-enable no-console */

  initMultiSelectManager: on('didInsertElement', function() {
    this.set('multiBlockSelect', MultiBlockSelect.create({
      element: this.get('element'),
      canvas: this.get('canvas')
    }));
  }),

  teardownMultiSelectManager: on('willDestroyElement', function() {
    this.get('multiBlockSelect').teardown();
  }),
});
