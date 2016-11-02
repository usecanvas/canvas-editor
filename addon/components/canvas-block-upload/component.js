import Base62UUID from 'canvas-editor/lib/base62-uuid';
import CardBlock from 'canvas-editor/components/canvas-block-card/component';
import FileUpload from 'canvas-editor/lib/file-upload';
import Ember from 'ember';
import layout from './template';
import styles from './styles';
import { task } from 'ember-concurrency';

/**
 * A component representing a pending upload.
 *
 * @class CanvasEditor.CanvasBlockUploadComponent
 * @extends CanvasEditor.CanvasBlockCardComponent
 */
export default CardBlock.extend({
  classNames: ['canvas-block-upload'],
  layout,
  localClassNames: ['canvas-block-upload'],
  styles,

  progress: 0,

  /**
   * Creates file upload object with appropriate parameters
   * @method generateFileUpload
   * @param {block} file The file to be uploaded
   * @param {string} key The file path to upload to
   * @param {CanvasWeb.UploadSignature} uploadSignature The signature model
   */
  generateFileUpload(file, key, uploadSignature) {
    return new FileUpload({
      key,
      'Content-Type': file.type,
      AWSAccessKeyId: uploadSignature.get('id'),
      acl: 'public-read',
      policy: uploadSignature.get('policy'),
      signature: uploadSignature.get('signature'),
      file
    });
  },

  /**
   * A listener for the upload that updates the meta progress
   * @method updateBlockProgress
   * @param {block} file The file to be uploaded
   * @param {number} loaded The number of bytes uploaded
   * @param {number} total The number of bytes in the file
   */
   updateBlockProgress: task(function *({ loaded, total }) {
    const block = this.get('block');
    const oldProgress = block.get('meta.progress');
    const newProgress = Math.round(100 * loaded / total);
    block.set('meta.progress', newProgress);
    yield this.get('onBlockMetaReplacedLocally')(
      block,
      ['progress'],
      oldProgress,
      newProgress);
  }),

  /**
   * Uploads the files and replaces with upload block with the result block
   * after success
   * @method uploadFile
   * @param {File} file The file to be uploaded
   * @param {CanvasEditor.CanvasRealtime.Block} block The result block
   */
  uploadFile: task(function *() {
    if (!this.get('block.file')) return;

    const block = this.get('block');
    const file = block.get('file');

    try {
      const key = `uploads/${Base62UUID.generate()}/${file.name}`;
      const uploadSignature = yield this.get('fetchUploadSignature')();
      if (!uploadSignature) return;
      const onprogress = Ember.run.bind(this.updateBlockProgress, 'perform');
      const uploadUrl = uploadSignature.get('uploadUrl');
      const fileUrl = `${uploadUrl}/${key}`;
      const upload = this.generateFileUpload(file, key, uploadSignature);

      block.set('meta.url', fileUrl);
      yield upload.upload(uploadUrl, onprogress);
      const type = file.type.split('/')[0] === 'image' ? 'image' : 'url-card';
      this.get('changeBlockType')(`upload/${type}`, block);
    } catch (_) {
      this.get('onBlockDeletedLocally')(block, null, { onlySelf: true });
    }
  }).on('init')
});
