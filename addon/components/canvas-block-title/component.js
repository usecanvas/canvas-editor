import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import Ember from 'ember';
import RSVP from 'rsvp';
import layout from './template';
import styles from './styles';

const { computed, get } = Ember;

/**
 * A component representing a "title" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockTitleComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend({
  classNames: ['canvas-block-title'],
  isShowingSelect: false,
  layout,
  localClassNames: ['component'],
  styles,

  showTemplates: computed('searchTerm', 'hasContent', 'isFocused', function() {
    return !this.get('hasContent') &&
      this.get('isFocused');
  }),

  actions: {
    remainFocused(evt) {
      evt.preventDefault();
    },

    selectTemplate(template) {
      this.get('onTemplateApply')(template);
    },

    filterTemplates(value) {
      if (!value) return RSVP.resolve([]);

      return this.get('fetchTemplates')().then(templates => {
        return templates.filter(template => {
          return get(template, 'blocks.0.content')
            .toLowerCase()
            .indexOf(value.toLowerCase()) > -1;
        });
      });
    }
  }
});
