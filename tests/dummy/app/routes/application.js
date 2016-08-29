import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import Ember from 'ember';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';

const { A } = Ember;

export default Ember.Route.extend({
  model() {
    return RealtimeCanvas.create({
      blocks: A([
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Hello, World']) }),
        Paragraph.create({ content: A(['Foo Bar Baz']) })
      ])
    });
  }
});
