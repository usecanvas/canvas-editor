/* eslint-disable max-len */

import CLItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import Ember from 'ember';
import List from 'canvas-editor/lib/realtime-canvas/list';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import Title from 'canvas-editor/lib/realtime-canvas/title';
import ULItem from 'canvas-editor/lib/realtime-canvas/unordered-list-item';

const { A } = Ember;

export default Ember.Route.extend({
  model() {
    return RealtimeCanvas.create({
      blocks: A([
        Title.create({ content: 'Canvas Editor' }),
        Paragraph.create({ content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' }),
        Paragraph.create({ content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' }),
        Paragraph.create({ content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' }),
        List.create({
          blocks: Ember.A([
            ULItem.create({ content: 'List item A' }),
            ULItem.create({ content: 'List item B', meta: { level: 2 } }),
            ULItem.create({ content: 'List item C' }),
            CLItem.create({ content: 'List item D', meta: { checked: true } }),
            CLItem.create({ content: 'List item E', meta: { checked: false, level: 2 } }),
            ULItem.create({ content: 'List item F' })
          ])
        }),
        Paragraph.create({ content: 'A short paragraph to end things on a good note...' })
      ])
    });
  }
});
