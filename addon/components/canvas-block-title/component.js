import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import Ember from 'ember';
import RSVP from 'rsvp';
import layout from './template';
import styles from './styles';

const { computed, get, observer } = Ember;

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
  localClassNames: ['canvas-block-title'],
  styles,
  selectedIndex: 0,

  resetSelectedIndex: observer('showTemplates', 'block.content', function() {
    if (this.get('showTemplates')) {
      this.set('selectedIndex', 0);
    }
  }),

  showTemplates: computed('searchTerm', 'hasContent', 'isFocused', function() {
    return !this.get('hasContent') &&
      this.get('isFocused');
  }),

  filterTemplates(value) {
    if (!value) return RSVP.resolve([]);

    return this.get('fetchTemplates')().then(templates => {
      return templates.filter(template => {
        return get(template, 'blocks.0.content')
          .toLowerCase()
          .includes(value.toLowerCase());
      });
    });
  },

  actions: {
    remainFocused(evt) {
      evt.preventDefault();
    },

    selectTemplate(template) {
      this.get('onTemplateApply')(template);
    },

    updateFilteredTemplates(templates) {
      this.set('filteredTemplates', templates);
    },

    updateSelectedIndex(index) {
      this.set('selectedIndex', index);
    },

    navigateAutocomplete(direction) {
      this.filterTemplates(this.get('block.content')).then(content => {
        const len = content.length;
        const selectedIndex =
          (len + this.get('selectedIndex') + direction) % len;
        this.set('selectedIndex', selectedIndex);
      });
    },

    selectTemplateByIndex(index) {
      this.filterTemplates(this.get('block.content')).then(content => {
        this.get('onTemplateApply')(content[index]);
      });
    }
  }
});
