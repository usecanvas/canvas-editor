# Canvas-editor

This README outlines the details of collaborating on this Ember addon.

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember serve`
* Visit your app at http://localhost:4200.

## Callbacks

There are a number of callbacks that can be passed to the editor:

- `onBlockContentUpdatedLocally`: Receives a block with `prevContent` and
  `content` properties when a block's content was updated locally.
- `onNewBlockInsertedLocally`: Receives an index and a new block object when a
  new block was inserted locally.
- `onBlockDeletedLocally`: Receives an index and a block after the block was
  deleted locally.

## Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember
  versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit
[http://ember-cli.com/](http://ember-cli.com/).
