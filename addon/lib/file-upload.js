import Ember from 'ember';

export default class FileUpload {
  constructor(opts) {
    this.form = new FormData();
    Object.keys(opts).forEach(key => this.form.append(key, opts[key]));
  }

  upload(url, onprogress) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = onprogress || function() {};

      xhr.addEventListener('load', () => {
        if (/^2\d{2}$/.test(xhr.status)) {
          resolve(xhr);
        } else {
          reject(new Error('File upload failed'), xhr);
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('File upload failed', xhr));
      });

      xhr.open('POST', url, true);
      xhr.send(this.form);
    });
  }
}
