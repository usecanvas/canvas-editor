export function initialize(application) {
  const customEvents = application.get('customEvents') || {};
  customEvents.paste = 'paste';
  application.set('customEvents', customEvents);
}

export default {
  name: 'custom-events',
  initialize
};
