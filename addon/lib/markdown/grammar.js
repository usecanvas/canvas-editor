/*
 * These regexes are in some places copies of, in others modifications of, and
 * in some places wholly unrelated to the Markdown regexes found in the
 * Stackedit project, which bears this license:
 *
 * StackEdit - The Markdown editor powered by PageDown.

 * Copyright 2013 Benoit Schweblin (http://www.benoitschweblin.com)
 * Licensed under an Apache License (http://www.apache.org/licenses/LICENSE-2.0)
 */

/* eslint-disable max-len */
/* eslint-disable camelcase */

const GRAMMAR = {};


GRAMMAR['inline-code'] = {
  classes: ['inline-code', 'has-folding'],
  pattern: /(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/,
  lookbehind: true,
  inside: {
    'inline-code-marker folding': /(?:^(?:`+))|(?:(?:`+)$)/
  }
};

GRAMMAR.link = {
  classes: ['link', 'has-folding'],
  pattern: /\[(?:(?:\\.)|[^[\]])+]\([^()\s]+(?:\(\S*?\))??[^()\s]*?(?:\s+(?:['‘][^'’]*['’]|["“][^"”]*["”]))?\)/gm,
  inside: {
    'bracket-start folding': {
      pattern: /(^|[^\\])\[/,
      lookbehind: true
    },

    'ref': {
      pattern: /(?:(?:\\.)|[^[\]])+(?=])/,
      inside: {}
    },

    'bracket-end folding': /](?=\s?\()/,
    'paren-start folding': /^\(/,
    'paren-end folding': /\)$/,
    'title folding': /\s+['‘"].*?['’”"]$/,
    'href folding': /\S*/,

  }
};

GRAMMAR.strong_star = {
  classes: ['strong', 'has-folding'],
  pattern: /([*]){2}(?:(?!\1{2}).)*[*]?\1{2}/g,
  inside: {
    'strong-marker folding': /(?:^(?:[*]){2})|(?:(?:[*]){2}$)/
  }
};

GRAMMAR.em_star = {
  classes: ['em', 'has-folding'],
  pattern: /(^|[^\\])([*])(\S[^\2]*?)??[^\s\\]+?\2/g,
  lookbehind: true,
  inside: {
    'em-marker folding': /(?:^(?:[*]))|(?:(?:[*])$)/
  }
};

GRAMMAR.url = {
  classes: ['url'],
  pattern: /(\s|^)(https?:\/\/\S*)/g,
  lookbehind: true
};

GRAMMAR.strong_underscore = {
  classes: ['strong', 'has-folding'],
  pattern: /(^|\s)([_]){2}(?:(?!\2{2}).)*[_]?\2{2}/g,
  lookbehind: true,
  inside: {
    'strong-marker folding': /(?:^(?:[_]){2})|(?:(?:[_]){2}$)/
  }
};

GRAMMAR.em_underscore = {
  classes: ['em', 'has-folding'],
  pattern: /(^|\s)([_])(\S[^\2]*?)??[^\s\\]+?\2/g,
  lookbehind: true,
  inside: {
    'em-marker folding': /(?:^(?:[_]))|(?:(?:[_])$)/
  }
};

['em_star', 'strong_star', 'em_underscore', 'strong_underscore'].forEach(emStrong => {
  GRAMMAR[emStrong].inside = GRAMMAR[emStrong].inside || {};
  GRAMMAR[emStrong].inside.inlines = {
    url: GRAMMAR.url,
    link: GRAMMAR.link,
    'inline-code': GRAMMAR['inline-code']
  };
});

GRAMMAR['inline-code'].inside.url = GRAMMAR.url;

GRAMMAR.link.inside.ref.inside.inlines = GRAMMAR.link.inside.ref.inside.inlines || {};

['inline-code', 'strong_star', 'em_star', 'strong_underscore',  'em_underscore'].forEach(emStrong => {
  GRAMMAR.link.inside.ref.inside.inlines[emStrong] = GRAMMAR[emStrong];
});

GRAMMAR.em_star.inside.inlines.strong_star = GRAMMAR.strong_star;
GRAMMAR.strong_star.inside.inlines.em_star = GRAMMAR.em_star;
GRAMMAR.em_star.inside.inlines.strong_underscore = GRAMMAR.strong_underscore;
GRAMMAR.strong_star.inside.inlines.em_underscore = GRAMMAR.em_underscore;

GRAMMAR.em_underscore.inside.inlines.strong_star = GRAMMAR.strong_star;
GRAMMAR.strong_underscore.inside.inlines.em_star = GRAMMAR.em_star;
GRAMMAR.em_underscore.inside.inlines.strong_underscore = GRAMMAR.strong_underscore;
GRAMMAR.strong_underscore.inside.inlines.em_underscore = GRAMMAR.em_underscore;


export default GRAMMAR;
