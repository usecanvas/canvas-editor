import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import DS from 'ember-data';
import Ember from 'ember';
import RSVP from 'rsvp';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

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

  templates: [{
      title: 'OKRs',
      blocks: [{
        type: 'paragraph',
        content: 'Paragraph content',
        meta: {}
      }]
    }, {
      title: 'Onboarding',
      blocks: [{
        type: 'paragraph',
        content: 'Foo bar',
        meta: {}
      }, {
        type: 'list',
        blocks: [{
          type: 'checklist-item',
          content: 'CL Item',
          meta: { checked: true }
        }]
      }]
    }, {
      title: 'Sprint Planning',
      blocks: [{
        type: 'paragraph',
        content: 'Paragraph content',
        meta: {}
      }]
    }],

  actions: {
    remainFocused(evt) {
      evt.preventDefault();
    },

    selectTemplate(template) {
      this.get('onTemplateApply')(template);
    },

    filterTemplates(value) {
      const templates = this.get('templates');
      let filteredTemplates = [];

      if (value) {
        filteredTemplates = templates.filter(function(item) {
          return item.title.toLowerCase().indexOf(value.toLowerCase()) > -1;
        });
      }

      return DS.PromiseArray.create({
        promise: RSVP.resolve(filteredTemplates)
      });
    }
  }
});
