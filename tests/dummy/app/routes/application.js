import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import Ember from 'ember';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import Title from 'canvas-editor/lib/realtime-canvas/title';

const { A } = Ember;

export default Ember.Route.extend({
  model() {
    return RealtimeCanvas.create({
      blocks: A([
        Title.create({ content: A(['The Title']) }),
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
        Paragraph.create({ content: A(['Foo Bar Baz']) }),
        Paragraph.create({ content: A(["Kitsch +1 tousled cliche. Lumbersexual distillery keffiyeh flannel, green juice put a bird on it ugh williamsburg mixtape art party. Yuccie skateboard bicycle rights cardigan, kickstarter vinyl knausgaard mumblecore four loko wayfarers salvia before they sold out. Flannel gluten-free pabst umami. Hammock before they sold out deep v, selfies knausgaard normcore gluten-free chambray helvetica readymade trust fund cliche health goth. Literally twee poutine umami, forage next level crucifix gluten-free ennui. Banjo +1 quinoa blue bottle cray tilde, selvage church-key meditation lomo sriracha bitters truffaut tattooed."]) })
      ])
    });
  }
});
