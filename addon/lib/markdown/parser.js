/*
 * The syntax parsing algorithm in this file is copied heavily from Lea Verou's
 * Prism project, which bears this license:
 *
 * MIT LICENSE
 *
 * Copyright (c) 2012-2013 Lea Verou
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/

/* eslint-disable */

import GRAMMAR from './grammar';

export function highlight(source) {
  return source.split(/\n/).map(line => {
    return stringify(encode(highlightParse(line)), 'md-');
  }).join('\n');
}

function highlightParse(source) {
  return maximalMatch(source, GRAMMAR);
}

function maximalMatch(source, grammar) {
  /* eslint-disable guard-for-in */
  let maxMatchLength = 0;
  let maxMatch = source;

  for (const token in grammar) {
    let patterns = grammar[token];

    if (!Array.isArray(patterns)) {
      patterns = [patterns];
    }

    for (let i = 0; i < patterns.length; i++) {
      let pattern                      = patterns[i];
      const { classes, inside } = pattern;
      const lookbehind                 = Boolean(pattern.lookbehind);
      let lookbehindLength             = 0;

      pattern = pattern.pattern || pattern;

      if (typeof source !== 'string') {
        continue;
      }

      pattern.lastIndex = 0;

      let match = pattern.exec(source);
      const stringMatch = Array.isArray(match) ? match[0] : match;

      if (!match) {
        continue;
      }
      else if (stringMatch.trim().length <= maxMatchLength) {
        continue;
      }

      if (lookbehind) {
        lookbehindLength = match[1].length;
      }

      const from = match.index - 1 + lookbehindLength;
      match = match[0].slice(lookbehindLength);
      const len = match.length;
      const to = from + len;
      const before = source.slice(0, from + 1);
      const after = source.slice(to + 1);
      const args = [];

      if (before) {
        args.push(maximalMatch(before, grammar));
      }

      const wrapped = {
        classes,
        text: inside ? tokenize(match, inside) : match,
        token
      };

      args.push(wrapped);

      if (after) {
        args.push(maximalMatch(after, grammar));
      }

      maxMatch = args;
      maxMatchLength = match.length;
    }
  }
  return maxMatch;
}

function tokenize(source, grammar) {
  const strings = [source];
  const inlines = grammar.inlines;

  if (inlines) {
    /* eslint-disable guard-for-in */
    for (const inlineToken in inlines) {
      grammar[inlineToken] = inlines[inlineToken];
    }
    /* eslint-enable guard-for-in */

    delete grammar.inlines;
  }

  /* eslint-disable guard-for-in */
  for (const token in grammar) {
    let patterns = grammar[token];

    if (!Array.isArray(patterns)) {
      patterns = [patterns];
    }

    for (let i = 0; i < patterns.length; i++) {
      let pattern                      = patterns[i];
      const { classes, inside } = pattern;
      const lookbehind                 = Boolean(pattern.lookbehind);
      let lookbehindLength             = 0;

      pattern = pattern.pattern || pattern;

      for (let i = 0; i < strings.length; i++) {
        const string = strings[i];

        if (typeof string !== 'string') {
          continue;
        }

        pattern.lastIndex = 0;

        let match = pattern.exec(string);

        if (!match) {
          continue;
        }

        if (lookbehind) {
          lookbehindLength = match[1].length;
        }

        const from = match.index - 1 + lookbehindLength;
        match = match[0].slice(lookbehindLength);
        const len = match.length;
        const to = from + len;
        const before = string.slice(0, from + 1);
        const after = string.slice(to + 1);
        const args = [i, 1];

        if (before) {
          args.push(before);
        }

        const wrapped = {
          classes,
          text: inside ? tokenize(match, inside) : match,
          token
        };

        args.push(wrapped);

        if (after) {
          args.push(after);
        }

        Array.prototype.splice.apply(strings, args);
      }
    }
  }
  /* eslint-enable guard-for-in */

  return strings;
}

function syntaxTokenize(text, grammar, _language) {
  const strarr = [text];

  const rest = grammar.rest;

  if (rest) {
    for (const token in rest) {
      grammar[token] = rest[token];
    }

    delete grammar.rest;
  }

  tokenloop: for (const token in grammar) {
    if (!grammar.hasOwnProperty(token) || !grammar[token]) {
      continue;
    }

    let patterns = grammar[token];
    patterns = Array.isArray(patterns) ? patterns : [patterns];

    for (let j = 0; j < patterns.length; ++j) {
      let pattern = patterns[j],
        inside = pattern.inside,
        lookbehind = Boolean(pattern.lookbehind),
        lookbehindLength = 0;

      pattern = pattern.pattern || pattern;

      for (let i = 0; i < strarr.length; i++) { // Don’t cache length as it changes during the loop

        const str = strarr[i];

        if (strarr.length > text.length) {
          // Something went terribly wrong, ABORT, ABORT!
          break tokenloop;
        }

        if (str.text !== undefined) {
          continue;
        }

        pattern.lastIndex = 0;

        let match = pattern.exec(str);

        if (match) {
          if (lookbehind) {
            lookbehindLength = match[1].length;
          }

          const from = match.index - 1 + lookbehindLength;

          match = match[0].slice(lookbehindLength);

          let len = match.length,
            to = from + len,
            before = str.slice(0, from + 1),
            after = str.slice(to + 1);

          const args = [i, 1];

          if (before) {
            args.push(before);
          }

          const wrapped = {
            text: inside ? syntaxTokenize(match, inside) : match,
            token
          };

          args.push(wrapped);

          if (after) {
            args.push(after);
          }

          Array.prototype.splice.apply(strarr, args);
        }
      }
    }
  }

  return strarr;
}

function stringify(source, prefix = '', replaceNewLines = true) {
  if (typeof source === 'string') {
    return replaceNewLines ? source.replace(/\n/g, '') : source;
  }

  if (Array.isArray(source)) {
    return source.reduce(function addItem(result, item) {
      return result + stringify(item, prefix);
    }, '');
  }

  const tag       = source.tag || 'span';
  const classList = source.classes || source.token.split(' ');
  const className   = classList.map(token => `${prefix}${token}`).join(' ');

  return [
    `<${tag} class="${className}">`,
      stringify(source.text, prefix),
    `</${tag}>`
  ].join('');
}

function encode(src) {
  if (Array.isArray(src)) {
    return src.map(encode);
  } else if (typeof src === 'object') {
    src.text = encode(src.text);
    return src;
  }

  return escapeHTML(src);
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
