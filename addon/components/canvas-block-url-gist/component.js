import Ember from 'ember';
import layout from './template';
import styles from 'canvas-editor/components/canvas-block-url-gist/styles';

const { computed, on } = Ember;

export default Ember.Component.extend({
  classNames: ['canvas-block-url-gist'],
  gist: computed.oneWay('unfurled.url'),
  layout,
  localClassNames: ['canvas-block-url-gist'],
  styles,

  updateIframeContent: on('didInsertElement', function() {
    const iframe = document.createElement('iframe');
    const iframeId = `gist-${Ember.guidFor(this)}`;
    iframe.id = iframeId;
    this.$('.gist').append(iframe);

    const script = `<script src="${this.get('gist')}.js"></script>`;
    const resizeFrame = `parent.document.querySelector('#${iframeId}').style.height = document.body.scrollHeight + 'px';`; // eslint-disable-line max-len
    const html = `<html><body onload="${resizeFrame}">${script}</body></html>`;

    let iframeDoc = iframe.document;
    if (iframe.contentDocument) {
      iframeDoc = iframe.contentDocument;
    } else if (iframe.contentWindow) {
      iframeDoc = iframe.contentWindow.document;
    }

    iframeDoc.open();
    iframeDoc.writeln(html);
    iframeDoc.close();
  })
});
