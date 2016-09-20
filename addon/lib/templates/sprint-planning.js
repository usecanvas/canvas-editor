export default {
  isTemplate: true,
  blocks: [
    {
      type: 'title',
      content: 'Sprint Planning',
      meta: {}
    },
    {
      type: 'heading',
      content: 'Retrospective',
      meta: {
        level: 2
      }
    },
    {
      type: 'tip',
      content: 'A good retrospective focuses on what went well, what didn\'t go well, and what could be improved. Try avoiding status updates...',
      meta: {}
    },
    {
      type: 'list',
      blocks: [
        {
          type: 'unordered-list-item',
          content: '',
          meta: {
            placeholder: 'Lessons learned...'
          }
        }
      ],
      meta: {}
    },
    {
      type: 'heading',
      content: 'Metrics',
      meta: {
        level: 2
      }
    },
    {
      type: 'tip',
      content: 'How is our business doing? Are we moving the needle? How do we know we\'re making progress?',
      meta: {}
    },
    {
      type: 'paragraph',
      content: '',
      meta: {
        placeholder: 'Metrics, graphs, and observations...'
      }
    },
    {
      type: 'heading',
      content: 'Planning',
      meta: {
        level: 2
      }
    },
    {
      type: 'tip',
      content: 'What do we want to get done this week? Be sure to be explicit when it comes to commitments. Put stretch goals below the line...',
      meta: {}
    },
    {
      type: 'heading',
      content: '',
      meta: {
        level: 3,
        placeholder: 'Project'
      }
    },
    {
      type: 'list',
      blocks: [
        {
          type: 'checklist-item',
          content: '',
          meta: {
            placeholder: 'Todo...'
          }
        }
      ],
      meta: {}
    },
  ]
};
