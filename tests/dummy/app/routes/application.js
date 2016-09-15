import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import List from 'canvas-editor/lib/realtime-canvas/list';
import ULItem from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import CLItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';
import CanvasCard from 'canvas-editor/lib/realtime-canvas/canvas-card';
import Ember from 'ember';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import Title from 'canvas-editor/lib/realtime-canvas/title';
import Tip from 'canvas-editor/lib/realtime-canvas/tip';
import HorizontalRule from 'canvas-editor/lib/realtime-canvas/horizontal-rule';
import Heading from 'canvas-editor/lib/realtime-canvas/heading';

const { A } = Ember;

export default Ember.Route.extend({
  model() {
    return RealtimeCanvas.create({
      blocks: A([
        Title.create({ content: 'The Title' }),
        Paragraph.create({ content: 'Hello, World' }),
        Heading.create({ content: 'This is a heading', meta: { level: 1 } }),
        Heading.create({ content: 'This is a heading', meta: { level: 2 } }),
        Heading.create({ content: 'This is a heading', meta: { level: 3 } }),
        Heading.create({ content: 'This is a heading', meta: { level: 4 } }),
        Heading.create({ content: 'This is a heading', meta: { level: 5 } }),
        Heading.create({ content: 'This is a heading', meta: { level: 6 } }),
        CanvasCard.create({ meta: { id: 'this is some id' } }),
        Tip.create({ content: 'This is a pro tip and it is super useful.' }),
        Paragraph.create({ content: 'Hello, World' }),
        URLCard.create({ meta: { url: 'https://usecanvas.com' } }),
        Paragraph.create({ content: 'Hello, World' }),
        Paragraph.create({ content: "Kitsch +1 tousled cliche. Lumbersexual distillery keffiyeh flannel, green juice put a bird on it ugh williamsburg mixtape art party. Yuccie skateboard bicycle rights cardigan, kickstarter vinyl knausgaard mumblecore four loko wayfarers salvia before they sold out. Flannel gluten-free pabst umami. Hammock before they sold out deep v, selfies knausgaard normcore gluten-free chambray helvetica readymade trust fund cliche health goth. Literally twee poutine umami, forage next level crucifix gluten-free ennui. Banjo +1 quinoa blue bottle cray tilde, selvage church-key meditation lomo sriracha bitters truffaut tattooed." }),
        Paragraph.create({ content: 'Hello, World' }),
        Paragraph.create({ content: 'Hello, World' }),
        List.create({
          blocks: A([
            ULItem.create({ content: 'List item A' }),
            ULItem.create({ content: 'List item B' }),
            ULItem.create({ content: 'List item C' }),
            CLItem.create({ content: 'List item D', meta: { checked: true } }),
            CLItem.create({ content: 'List item E', meta: { checked: false } }),
            ULItem.create({ content: 'List item F' })
          ])
        }),
        Paragraph.create({ content: 'Hello, World' }),
        Paragraph.create({ content: 'Hello, World' }),
        HorizontalRule.create(),
        Paragraph.create({ content: 'Hello, World' }),
        Paragraph.create({ content: 'Hello, World' }),
        Paragraph.create({ content: 'Hello, World' }),
        Paragraph.create({ content: 'Hello, World' }),
        Paragraph.create({ content: 'Hello, World' }),
        Paragraph.create({ content: 'Foo Bar Baz' }),
        Paragraph.create({ content: "Kitsch +1 tousled cliche. Lumbersexual distillery keffiyeh flannel, green juice put a bird on it ugh williamsburg mixtape art party. Yuccie skateboard bicycle rights cardigan, kickstarter vinyl knausgaard mumblecore four loko wayfarers salvia before they sold out. Flannel gluten-free pabst umami. Hammock before they sold out deep v, selfies knausgaard normcore gluten-free chambray helvetica readymade trust fund cliche health goth. Literally twee poutine umami, forage next level crucifix gluten-free ennui. Banjo +1 quinoa blue bottle cray tilde, selvage church-key meditation lomo sriracha bitters truffaut tattooed." })
      ])
    });
  }
});
