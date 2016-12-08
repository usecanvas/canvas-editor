/* eslint-disable max-len */

import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

const USER_FIXTURES = [
  {
    name: '@oren',
    thumbnailUrl: 'https://avatars.slack-edge.com/2014-08-15/2549070936_original.jpg'
  },
  {
    name: '@max',
    thumbnailUrl: 'https://avatars.slack-edge.com/2014-08-30/2601551525_original.jpg'
  },
  {
    name: '@olivia',
    thumbnailUrl: 'https://ca.slack-edge.com/T029RJ71Y-U06RS4V2L-g0fa3c95bfc5-72'
  }
];

const MESSAGE_FIXTURES = [
  {
    author: 0,
    text: 'Long story but I think that there is no RFC yet. I\'m pretty sure we have enough headroom to add it. Do you want to write something up?',
    createdAt: '7:45PM'
  },
  {
    author: 1,
    text: 'Sure. I\'m thinking we should include basic behavior, how it ties into Slack, and possibly consider threads?',
    createdAt: '7:46PM'
  },
  {
    author: 0,
    text: 'That outline SGTM. Make sure to involve API early on.',
    createdAt: '7:48PM'
  },
  {
    author: 0,
    text: 'Anyone know the guest wi-fi password?',
    createdAt: '8:01PM'
  },
  {
    author: 1,
    text: 'Yup, it\'s in the wiki.',
    createdAt: '8:10PM'
  },
  {
    author: 0,
    text: 'ugh. who uses the wiki anymore?! thanks though!',
    createdAt: '8:11PM'
  },
  {
    author: 0,
    text: 'found it! woot',
    createdAt: '8:12PM'
  },
  {
    author: 1,
    text: '@here, lunch is ready. Mexican today.',
    createdAt: '12:01PM'
  },
  {
    author: 2,
    text: 'Thanks. I\'ll be right down once I figure out how to make gulp behave like it should. Builds are failing on heroku/dev and I can\'t figure out why for the life of me.',
    createdAt: '12:03PM'
  },
  {
    author: 1,
    text: 'Oh, I think Tim had a similar issue. May want to ask him.',
    createdAt: '12:04PM'
  }
];

export default Ember.Component.extend({
  count: 1,
  layout,
  showSettings: false,
  styles,

  messages: computed('unfurled.text', 'unfurled.thumbnailUrl', function() {
    const messages = Ember.A([
      Ember.Object.create({
        author: '@olivia',
        createdAt: '07:31PM',
        text: this.get('unfurled.text'),
        thumbnailUrl: this.get('unfurled.thumbnailUrl')
      }),
    ]);

    MESSAGE_FIXTURES.forEach(item => {
      const message = Ember.Object.create({
        author: USER_FIXTURES[item.author].name,
        createdAt: item.createdAt,
        text: item.text,
        thumbnailUrl: USER_FIXTURES[item.author].thumbnailUrl
      });

      messages.pushObject(message);
    });

    return messages;
  }),

  filteredMessages: computed('count', 'messages', function() {
    const text = this.get('messages');
    return text.slice(0, this.get('count'));
  }),

  actions: {
    toggleShowSettings() {
      this.toggleProperty('showSettings');
    }
  }
});
