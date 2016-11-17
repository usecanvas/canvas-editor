# CanvasEditor [![CircleCI](https://circleci.com/gh/usecanvas/canvas-editor/tree/master.svg?style=svg&circle-token=ab0f7f55d447b8a22904e7a438fc203ddde663c0)](https://circleci.com/gh/usecanvas/canvas-editor/tree/master)

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
  
## Versioning

To release a new version of CanvasEditor:

* `npm run version major|minor|patch` to increment the version
* `git push origin master` to push the increment commit
* `git push origin master --tags` to push the increment tag
* `npm publish` to release to NPM

## Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember
  versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit
[http://ember-cli.com/](http://ember-cli.com/).
