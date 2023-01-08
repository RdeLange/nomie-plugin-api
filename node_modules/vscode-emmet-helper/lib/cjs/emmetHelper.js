"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmmetCompletionParticipants = exports.getEmmetMode = exports.updateExtensionsPath = exports.expandAbbreviation = exports.parseAbbreviation = exports.getExpandOptions = exports.isAbbreviationValid = exports.extractAbbreviationFromText = exports.extractAbbreviation = exports.getDefaultSnippets = exports.getDefaultSyntax = exports.getSyntaxType = exports.isStyleSheet = exports.emmetSnippetField = exports.doComplete = exports.FileType = void 0;
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const JSONC = __importStar(require("jsonc-parser"));
const data_1 = require("./data");
const vscode_uri_1 = require("vscode-uri");
const fileService_1 = require("./fileService");
Object.defineProperty(exports, "FileType", { enumerable: true, get: function () { return fileService_1.FileType; } });
const util_1 = require("util");
const emmet_1 = __importStar(require("emmet"));
const configCompat_1 = require("./configCompat");
const nls = __importStar(require("vscode-nls"));
const localize = nls.loadMessageBundle();
const snippetKeyCache = new Map();
let markupSnippetKeys;
const stylesheetCustomSnippetsKeyCache = new Map();
const htmlAbbreviationStartRegex = /^[a-z,A-Z,!,(,[,#,\.]/;
const cssAbbreviationRegex = /^-?[a-z,A-Z,!,@,#]/;
const htmlAbbreviationRegex = /[a-z,A-Z\.]/;
const commonlyUsedTags = [...data_1.htmlData.tags, 'lorem'];
const bemFilterSuffix = 'bem';
const filterDelimitor = '|';
const trimFilterSuffix = 't';
const commentFilterSuffix = 'c';
const maxFilters = 3;
const vendorPrefixes = { 'w': "webkit", 'm': "moz", 's': "ms", 'o': "o" };
const defaultVendorProperties = {
    'w': "animation, animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, appearance, backface-visibility, background-clip, background-composite, background-origin, background-size, border-fit, border-horizontal-spacing, border-image, border-vertical-spacing, box-align, box-direction, box-flex, box-flex-group, box-lines, box-ordinal-group, box-orient, box-pack, box-reflect, box-shadow, color-correction, column-break-after, column-break-before, column-break-inside, column-count, column-gap, column-rule-color, column-rule-style, column-rule-width, column-span, column-width, dashboard-region, font-smoothing, highlight, hyphenate-character, hyphenate-limit-after, hyphenate-limit-before, hyphens, line-box-contain, line-break, line-clamp, locale, margin-before-collapse, margin-after-collapse, marquee-direction, marquee-increment, marquee-repetition, marquee-style, mask-attachment, mask-box-image, mask-box-image-outset, mask-box-image-repeat, mask-box-image-slice, mask-box-image-source, mask-box-image-width, mask-clip, mask-composite, mask-image, mask-origin, mask-position, mask-repeat, mask-size, nbsp-mode, perspective, perspective-origin, rtl-ordering, text-combine, text-decorations-in-effect, text-emphasis-color, text-emphasis-position, text-emphasis-style, text-fill-color, text-orientation, text-security, text-stroke-color, text-stroke-width, transform, transition, transform-origin, transform-style, transition-delay, transition-duration, transition-property, transition-timing-function, user-drag, user-modify, user-select, writing-mode, svg-shadow, box-sizing, border-radius",
    'm': "animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, appearance, backface-visibility, background-inline-policy, binding, border-bottom-colors, border-image, border-left-colors, border-right-colors, border-top-colors, box-align, box-direction, box-flex, box-ordinal-group, box-orient, box-pack, box-shadow, box-sizing, column-count, column-gap, column-rule-color, column-rule-style, column-rule-width, column-width, float-edge, font-feature-settings, font-language-override, force-broken-image-icon, hyphens, image-region, orient, outline-radius-bottomleft, outline-radius-bottomright, outline-radius-topleft, outline-radius-topright, perspective, perspective-origin, stack-sizing, tab-size, text-blink, text-decoration-color, text-decoration-line, text-decoration-style, text-size-adjust, transform, transform-origin, transform-style, transition, transition-delay, transition-duration, transition-property, transition-timing-function, user-focus, user-input, user-modify, user-select, window-shadow, background-clip, border-radius",
    's': "accelerator, backface-visibility, background-position-x, background-position-y, behavior, block-progression, box-align, box-direction, box-flex, box-line-progression, box-lines, box-ordinal-group, box-orient, box-pack, content-zoom-boundary, content-zoom-boundary-max, content-zoom-boundary-min, content-zoom-chaining, content-zoom-snap, content-zoom-snap-points, content-zoom-snap-type, content-zooming, filter, flow-from, flow-into, font-feature-settings, grid-column, grid-column-align, grid-column-span, grid-columns, grid-layer, grid-row, grid-row-align, grid-row-span, grid-rows, high-contrast-adjust, hyphenate-limit-chars, hyphenate-limit-lines, hyphenate-limit-zone, hyphens, ime-mode, interpolation-mode, layout-flow, layout-grid, layout-grid-char, layout-grid-line, layout-grid-mode, layout-grid-type, line-break, overflow-style, perspective, perspective-origin, perspective-origin-x, perspective-origin-y, scroll-boundary, scroll-boundary-bottom, scroll-boundary-left, scroll-boundary-right, scroll-boundary-top, scroll-chaining, scroll-rails, scroll-snap-points-x, scroll-snap-points-y, scroll-snap-type, scroll-snap-x, scroll-snap-y, scrollbar-arrow-color, scrollbar-base-color, scrollbar-darkshadow-color, scrollbar-face-color, scrollbar-highlight-color, scrollbar-shadow-color, scrollbar-track-color, text-align-last, text-autospace, text-justify, text-kashida-space, text-overflow, text-size-adjust, text-underline-position, touch-action, transform, transform-origin, transform-origin-x, transform-origin-y, transform-origin-z, transform-style, transition, transition-delay, transition-duration, transition-property, transition-timing-function, user-select, word-break, wrap-flow, wrap-margin, wrap-through, writing-mode",
    'o': "dashboard-region, animation, animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, border-image, link, link-source, object-fit, object-position, tab-size, table-baseline, transform, transform-origin, transition, transition-delay, transition-duration, transition-property, transition-timing-function, accesskey, input-format, input-required, marquee-dir, marquee-loop, marquee-speed, marquee-style"
};
const vendorPrefixesEnabled = false;
/**
 * Returns all applicable emmet expansions for abbreviation at given position in a CompletionList
 * @param document TextDocument in which completions are requested
 * @param position Position in the document at which completions are requested
 * @param syntax Emmet supported language
 * @param emmetConfig Emmet Configurations as derived from VS Code
 */
function doComplete(document, position, syntax, emmetConfig) {
    var _a;
    if (emmetConfig.showExpandedAbbreviation === 'never' || !getEmmetMode(syntax, emmetConfig.excludeLanguages)) {
        return;
    }
    const isStyleSheetRes = isStyleSheet(syntax);
    // Fetch markupSnippets so that we can provide possible abbreviation completions
    // For example, when text at position is `a`, completions should return `a:blank`, `a:link`, `acr` etc.
    if (!isStyleSheetRes) {
        if (!snippetKeyCache.has(syntax)) {
            const registry = (_a = customSnippetsRegistry[syntax]) !== null && _a !== void 0 ? _a : getDefaultSnippets(syntax);
            snippetKeyCache.set(syntax, Object.keys(registry));
        }
        markupSnippetKeys = snippetKeyCache.get(syntax);
    }
    const extractOptions = { lookAhead: !isStyleSheetRes, type: isStyleSheetRes ? 'stylesheet' : 'markup' };
    const extractedValue = extractAbbreviation(document, position, extractOptions);
    if (!extractedValue) {
        return;
    }
    const { abbreviationRange, abbreviation, filter } = extractedValue;
    const currentLineTillPosition = getCurrentLine(document, position).substr(0, position.character);
    const currentWord = getCurrentWord(currentLineTillPosition);
    // Don't attempt to expand open tags
    if (currentWord === abbreviation
        && currentLineTillPosition.endsWith(`<${abbreviation}`)
        && configCompat_1.syntaxes.markup.includes(syntax)) {
        return;
    }
    const expandOptions = getExpandOptions(syntax, emmetConfig, filter);
    let expandedText;
    let expandedAbbr;
    let completionItems = [];
    // Create completion item after expanding given abbreviation 
    // if abbreviation is valid and expanded value is not noise
    const createExpandedAbbr = (syntax, abbr) => {
        if (!isAbbreviationValid(syntax, abbreviation)) {
            return;
        }
        try {
            expandedText = emmet_1.default(abbr, expandOptions);
        }
        catch (e) {
        }
        if (!expandedText || isExpandedTextNoise(syntax, abbr, expandedText)) {
            return;
        }
        expandedAbbr = vscode_languageserver_types_1.CompletionItem.create(abbr);
        expandedAbbr.textEdit = vscode_languageserver_types_1.TextEdit.replace(abbreviationRange, escapeNonTabStopDollar(addFinalTabStop(expandedText)));
        expandedAbbr.documentation = replaceTabStopsWithCursors(expandedText);
        expandedAbbr.insertTextFormat = vscode_languageserver_types_1.InsertTextFormat.Snippet;
        expandedAbbr.detail = localize('Emmet abbreviation', "Emmet Abbreviation");
        expandedAbbr.label = abbreviation;
        expandedAbbr.label += filter ? '|' + filter.replace(',', '|') : "";
        completionItems = [expandedAbbr];
    };
    if (isStyleSheet(syntax)) {
        const { prefixOptions, abbreviationWithoutPrefix } = splitVendorPrefix(abbreviation);
        createExpandedAbbr(syntax, abbreviationWithoutPrefix);
        // When abbr is longer than usual emmet snippets and matches better with existing css property, then no emmet
        if (abbreviationWithoutPrefix.length > 4
            && data_1.cssData.properties.find(x => x.startsWith(abbreviationWithoutPrefix))) {
            return vscode_languageserver_types_1.CompletionList.create([], true);
        }
        if (expandedAbbr) {
            const prefixedExpandedText = applyVendorPrefixes(expandedText, prefixOptions, expandOptions.options);
            expandedAbbr.textEdit = vscode_languageserver_types_1.TextEdit.replace(abbreviationRange, escapeNonTabStopDollar(addFinalTabStop(prefixedExpandedText)));
            expandedAbbr.documentation = replaceTabStopsWithCursors(prefixedExpandedText);
            expandedAbbr.label = removeTabStops(expandedText);
            expandedAbbr.filterText = abbreviation;
            // Custom snippets should show up in completions if abbreviation is a prefix
            const stylesheetCustomSnippetsKeys = stylesheetCustomSnippetsKeyCache.has(syntax) ? stylesheetCustomSnippetsKeyCache.get(syntax) : stylesheetCustomSnippetsKeyCache.get('css');
            completionItems = makeSnippetSuggestion(stylesheetCustomSnippetsKeys, abbreviation, abbreviation, abbreviationRange, expandOptions, 'Emmet Custom Snippet', false);
            if (!completionItems.find(x => x.textEdit.newText === expandedAbbr.textEdit.newText)) {
                // Fix for https://github.com/Microsoft/vscode/issues/28933#issuecomment-309236902
                // When user types in propertyname, emmet uses it to match with snippet names, resulting in width -> widows or font-family -> font: family
                // Filter out those cases here.
                const abbrRegex = new RegExp('.*' + abbreviationWithoutPrefix.split('').map(x => (x === '$' || x === '+') ? '\\' + x : x).join('.*') + '.*', 'i');
                if (/\d/.test(abbreviation) || abbrRegex.test(expandedAbbr.label)) {
                    completionItems.push(expandedAbbr);
                }
            }
        }
        if (vendorPrefixesEnabled) {
            // Incomplete abbreviations that use vendor prefix
            if (!completionItems.length && (abbreviation === '-' || /^-[wmso]{1,4}-?$/.test(abbreviation))) {
                return vscode_languageserver_types_1.CompletionList.create([], true);
            }
        }
    }
    else {
        createExpandedAbbr(syntax, abbreviation);
        let tagToFindMoreSuggestionsFor = abbreviation;
        const newTagMatches = abbreviation.match(/(>|\+)([\w:-]+)$/);
        if (newTagMatches && newTagMatches.length === 3) {
            tagToFindMoreSuggestionsFor = newTagMatches[2];
        }
        const commonlyUsedTagSuggestions = makeSnippetSuggestion(commonlyUsedTags, tagToFindMoreSuggestionsFor, abbreviation, abbreviationRange, expandOptions, 'Emmet Abbreviation');
        completionItems = completionItems.concat(commonlyUsedTagSuggestions);
        if (emmetConfig.showAbbreviationSuggestions === true) {
            const abbreviationSuggestions = makeSnippetSuggestion(markupSnippetKeys.filter(x => !commonlyUsedTags.includes(x)), tagToFindMoreSuggestionsFor, abbreviation, abbreviationRange, expandOptions, 'Emmet Abbreviation');
            // Workaround for the main expanded abbr not appearing before the snippet suggestions
            if (expandedAbbr && abbreviationSuggestions.length > 0 && tagToFindMoreSuggestionsFor !== abbreviation) {
                expandedAbbr.sortText = '0' + expandedAbbr.label;
                abbreviationSuggestions.forEach(item => {
                    // Workaround for snippet suggestions items getting filtered out as the complete abbr does not start with snippetKey 
                    item.filterText = abbreviation;
                    // Workaround for the main expanded abbr not appearing before the snippet suggestions
                    item.sortText = '9' + abbreviation;
                });
            }
            completionItems = completionItems.concat(abbreviationSuggestions);
        }
    }
    if (emmetConfig.showSuggestionsAsSnippets === true) {
        completionItems.forEach(x => x.kind = vscode_languageserver_types_1.CompletionItemKind.Snippet);
    }
    return completionItems.length ? vscode_languageserver_types_1.CompletionList.create(completionItems, true) : undefined;
}
exports.doComplete = doComplete;
/**
 * Create & return snippets for snippet keys that start with given prefix
 */
function makeSnippetSuggestion(snippetKeys, prefix, abbreviation, abbreviationRange, expandOptions, snippetDetail, skipFullMatch = true) {
    if (!prefix || !snippetKeys) {
        return [];
    }
    const snippetCompletions = [];
    snippetKeys.forEach(snippetKey => {
        if (!snippetKey.startsWith(prefix.toLowerCase()) || (skipFullMatch && snippetKey === prefix.toLowerCase())) {
            return;
        }
        const currentAbbr = abbreviation + snippetKey.substr(prefix.length);
        let expandedAbbr;
        try {
            expandedAbbr = emmet_1.default(currentAbbr, expandOptions);
        }
        catch (e) {
        }
        if (!expandedAbbr) {
            return;
        }
        const item = vscode_languageserver_types_1.CompletionItem.create(prefix + snippetKey.substr(prefix.length));
        item.documentation = replaceTabStopsWithCursors(expandedAbbr);
        item.detail = snippetDetail;
        item.textEdit = vscode_languageserver_types_1.TextEdit.replace(abbreviationRange, escapeNonTabStopDollar(addFinalTabStop(expandedAbbr)));
        item.insertTextFormat = vscode_languageserver_types_1.InsertTextFormat.Snippet;
        snippetCompletions.push(item);
    });
    return snippetCompletions;
}
function getCurrentWord(currentLineTillPosition) {
    if (currentLineTillPosition) {
        const matches = currentLineTillPosition.match(/[\w,:,-,\.]*$/);
        if (matches) {
            return matches[0];
        }
    }
}
function replaceTabStopsWithCursors(expandedWord) {
    return expandedWord.replace(/([^\\])\$\{\d+\}/g, '$1|').replace(/\$\{\d+:([^\}]+)\}/g, '$1');
}
function removeTabStops(expandedWord) {
    return expandedWord.replace(/([^\\])\$\{\d+\}/g, '$1').replace(/\$\{\d+:([^\}]+)\}/g, '$1');
}
function escapeNonTabStopDollar(text) {
    return text ? text.replace(/([^\\])(\$)([^\{])/g, '$1\\$2$3') : text;
}
function addFinalTabStop(text) {
    if (!text || !text.trim()) {
        return text;
    }
    let maxTabStop = -1;
    let maxTabStopRanges = [];
    let foundLastStop = false;
    let replaceWithLastStop = false;
    let i = 0;
    const n = text.length;
    try {
        while (i < n && !foundLastStop) {
            // Look for ${
            if (text[i++] != '$' || text[i++] != '{') {
                continue;
            }
            // Find tabstop
            let numberStart = -1;
            let numberEnd = -1;
            while (i < n && /\d/.test(text[i])) {
                numberStart = numberStart < 0 ? i : numberStart;
                numberEnd = i + 1;
                i++;
            }
            // If ${ was not followed by a number and either } or :, then its not a tabstop
            if (numberStart === -1 || numberEnd === -1 || i >= n || (text[i] != '}' && text[i] != ':')) {
                continue;
            }
            // If ${0} was found, then break
            const currentTabStop = text.substring(numberStart, numberEnd);
            foundLastStop = currentTabStop === '0';
            if (foundLastStop) {
                break;
            }
            let foundPlaceholder = false;
            if (text[i++] == ':') {
                // TODO: Nested placeholders may break here
                while (i < n) {
                    if (text[i] == '}') {
                        foundPlaceholder = true;
                        break;
                    }
                    i++;
                }
            }
            // Decide to replace currentTabStop with ${0} only if its the max among all tabstops and is not a placeholder
            if (Number(currentTabStop) > Number(maxTabStop)) {
                maxTabStop = currentTabStop;
                maxTabStopRanges = [{ numberStart, numberEnd }];
                replaceWithLastStop = !foundPlaceholder;
            }
            else if (currentTabStop == maxTabStop) {
                maxTabStopRanges.push({ numberStart, numberEnd });
            }
        }
    }
    catch (e) {
    }
    if (replaceWithLastStop && !foundLastStop) {
        for (let i = 0; i < maxTabStopRanges.length; i++) {
            const rangeStart = maxTabStopRanges[i].numberStart;
            const rangeEnd = maxTabStopRanges[i].numberEnd;
            text = text.substr(0, rangeStart) + '0' + text.substr(rangeEnd);
        }
    }
    return text;
}
function getCurrentLine(document, position) {
    const offset = document.offsetAt(position);
    const text = document.getText();
    let start = 0;
    let end = text.length;
    for (let i = offset - 1; i >= 0; i--) {
        if (text[i] === '\n') {
            start = i + 1;
            break;
        }
    }
    for (let i = offset; i < text.length; i++) {
        if (text[i] === '\n') {
            end = i;
            break;
        }
    }
    return text.substring(start, end);
}
let customSnippetsRegistry = {};
let variablesFromFile = {};
let profilesFromFile = {};
exports.emmetSnippetField = (index, placeholder) => `\${${index}${placeholder ? ':' + placeholder : ''}}`;
/** Returns whether or not syntax is a supported stylesheet syntax, like CSS */
function isStyleSheet(syntax) {
    return configCompat_1.syntaxes.stylesheet.includes(syntax);
}
exports.isStyleSheet = isStyleSheet;
/** Returns the syntax type, either markup (e.g. for HTML) or stylesheet (e.g. for CSS) */
function getSyntaxType(syntax) {
    return isStyleSheet(syntax) ? 'stylesheet' : 'markup';
}
exports.getSyntaxType = getSyntaxType;
/** Returns the default syntax (html or css) to use for the snippets registry */
function getDefaultSyntax(syntax) {
    return isStyleSheet(syntax) ? 'css' : 'html';
}
exports.getDefaultSyntax = getDefaultSyntax;
/** Returns the default snippets that Emmet suggests */
function getDefaultSnippets(syntax) {
    const syntaxType = getSyntaxType(syntax);
    const syntaxToUse = isStyleSheet(syntax) ? getDefaultSyntax(syntax) : syntax;
    const emptyUserConfig = { type: syntaxType, syntax: syntaxToUse };
    const resolvedConfig = emmet_1.resolveConfig(emptyUserConfig);
    // https://github.com/microsoft/vscode/issues/97632
    // don't return markup (HTML) snippets for XML
    return syntax === 'xml' ? {} : resolvedConfig.snippets;
}
exports.getDefaultSnippets = getDefaultSnippets;
function getFilters(text, pos) {
    let filter;
    for (let i = 0; i < maxFilters; i++) {
        if (text.endsWith(`${filterDelimitor}${bemFilterSuffix}`, pos)) {
            pos -= bemFilterSuffix.length + 1;
            filter = filter ? bemFilterSuffix + ',' + filter : bemFilterSuffix;
        }
        else if (text.endsWith(`${filterDelimitor}${commentFilterSuffix}`, pos)) {
            pos -= commentFilterSuffix.length + 1;
            filter = filter ? commentFilterSuffix + ',' + filter : commentFilterSuffix;
        }
        else if (text.endsWith(`${filterDelimitor}${trimFilterSuffix}`, pos)) {
            pos -= trimFilterSuffix.length + 1;
            filter = filter ? trimFilterSuffix + ',' + filter : trimFilterSuffix;
        }
        else {
            break;
        }
    }
    return {
        pos: pos,
        filter: filter
    };
}
/**
 * Extracts abbreviation from the given position in the given document
 * @param document The TextDocument from which abbreviation needs to be extracted
 * @param position The Position in the given document from where abbreviation needs to be extracted
 * @param options The options to pass to the @emmetio/extract-abbreviation module
 */
function extractAbbreviation(document, position, options) {
    const currentLine = getCurrentLine(document, position);
    const currentLineTillPosition = currentLine.substr(0, position.character);
    const { pos, filter } = getFilters(currentLineTillPosition, position.character);
    const lengthOccupiedByFilter = filter ? filter.length + 1 : 0;
    try {
        const result = emmet_1.extract(currentLine, pos, options);
        const rangeToReplace = vscode_languageserver_types_1.Range.create(position.line, result.location, position.line, result.location + result.abbreviation.length + lengthOccupiedByFilter);
        return {
            abbreviationRange: rangeToReplace,
            abbreviation: result.abbreviation,
            filter
        };
    }
    catch (e) {
    }
}
exports.extractAbbreviation = extractAbbreviation;
/**
 * Extracts abbreviation from the given text
 * @param text Text from which abbreviation needs to be extracted
 * @param syntax Syntax used to extract the abbreviation from the given text
 */
function extractAbbreviationFromText(text, syntax) {
    if (!text) {
        return;
    }
    const { pos, filter } = getFilters(text, text.length);
    try {
        const extractOptions = (isStyleSheet(syntax) || syntax === 'stylesheet') ?
            { syntax: 'stylesheet', lookAhead: false } : { lookAhead: true };
        const result = emmet_1.extract(text, pos, extractOptions);
        return {
            abbreviation: result.abbreviation,
            filter
        };
    }
    catch (e) {
    }
}
exports.extractAbbreviationFromText = extractAbbreviationFromText;
/**
 * Returns a boolean denoting validity of given abbreviation in the context of given syntax
 * Not needed once https://github.com/emmetio/atom-plugin/issues/22 is fixed
 * @param syntax string
 * @param abbreviation string
 */
function isAbbreviationValid(syntax, abbreviation) {
    if (!abbreviation) {
        return false;
    }
    if (isStyleSheet(syntax)) {
        // Fix for https://github.com/Microsoft/vscode/issues/1623 in new emmet
        if (abbreviation.endsWith(':')) {
            return false;
        }
        if (abbreviation.includes('#')) {
            return hexColorRegex.test(abbreviation) || propertyHexColorRegex.test(abbreviation);
        }
        return cssAbbreviationRegex.test(abbreviation);
    }
    if (abbreviation.startsWith('!')) {
        return !/[^!]/.test(abbreviation);
    }
    // Its common for users to type (sometextinsidebrackets), this should not be treated as an abbreviation
    // Grouping in abbreviation is valid only if it's inside a text node or preceeded/succeeded with one of the symbols for nesting, sibling, repeater or climb up
    if ((/\(/.test(abbreviation) || /\)/.test(abbreviation)) && !/\{[^\}\{]*[\(\)]+[^\}\{]*\}(?:[>\+\*\^]|$)/.test(abbreviation) && !/\(.*\)[>\+\*\^]/.test(abbreviation) && !/[>\+\*\^]\(.*\)/.test(abbreviation)) {
        return false;
    }
    return (htmlAbbreviationStartRegex.test(abbreviation) && htmlAbbreviationRegex.test(abbreviation));
}
exports.isAbbreviationValid = isAbbreviationValid;
function isExpandedTextNoise(syntax, abbreviation, expandedText) {
    // Unresolved css abbreviations get expanded to a blank property value
    // Eg: abc -> abc: ; or abc:d -> abc: d; which is noise if it gets suggested for every word typed
    if (isStyleSheet(syntax)) {
        const after = (syntax === 'sass' || syntax === 'stylus') ? '' : ';';
        return expandedText === `${abbreviation}: \${1}${after}` || expandedText.replace(/\s/g, '') === abbreviation.replace(/\s/g, '') + after;
    }
    if (commonlyUsedTags.includes(abbreviation.toLowerCase()) || markupSnippetKeys.includes(abbreviation)) {
        return false;
    }
    // Custom tags can have - or :
    if (/[-,:]/.test(abbreviation) && !/--|::/.test(abbreviation) && !abbreviation.endsWith(':')) {
        return false;
    }
    // Its common for users to type some text and end it with period, this should not be treated as an abbreviation
    // Else it becomes noise.
    // When user just types '.', return the expansion
    // Otherwise emmet loses change to participate later
    // For example in `.foo`. See https://github.com/Microsoft/vscode/issues/66013
    if (abbreviation === '.') {
        return false;
    }
    const dotMatches = abbreviation.match(/^([a-z,A-Z,\d]*)\.$/);
    if (dotMatches) {
        // Valid html tags such as `div.`
        if (dotMatches[1] && data_1.htmlData.tags.includes(dotMatches[1])) {
            return false;
        }
        return true;
    }
    // Unresolved html abbreviations get expanded as if it were a tag
    // Eg: abc -> <abc></abc> which is noise if it gets suggested for every word typed
    return (expandedText.toLowerCase() === `<${abbreviation.toLowerCase()}>\${1}</${abbreviation.toLowerCase()}>`);
}
/**
 * Returns options to be used by emmet
 */
function getExpandOptions(syntax, emmetConfig, filter) {
    var _a, _b, _c, _d, _e;
    emmetConfig = emmetConfig || {};
    emmetConfig['preferences'] = emmetConfig['preferences'] || {};
    const preferences = emmetConfig['preferences'];
    const stylesheetSyntax = isStyleSheet(syntax) ? syntax : 'css';
    // Fetch Profile
    const profile = getProfile(syntax, emmetConfig['syntaxProfiles']);
    const filtersFromProfile = (profile && profile['filters']) ? profile['filters'].split(',') : [];
    const trimmedFilters = filtersFromProfile.map(filterFromProfile => filterFromProfile.trim());
    const bemEnabled = (filter && filter.split(',').some(x => x.trim() === 'bem')) || trimmedFilters.includes('bem');
    const commentEnabled = (filter && filter.split(',').some(x => x.trim() === 'c')) || trimmedFilters.includes('c');
    // Fetch formatters
    const formatters = getFormatters(syntax, emmetConfig['preferences']);
    const unitAliases = ((formatters === null || formatters === void 0 ? void 0 : formatters.stylesheet) && formatters.stylesheet['unitAliases']) || {};
    const defaultVSCodeOptions = {
        // inlineElements: string[],
        // 'output.indent': string,
        // 'output.baseIndent': string,
        // 'output.newline': string,
        // 'output.tagCase': profile['tagCase'],
        // 'output.attributeCase': profile['attributeCase'],
        // 'output.attributeQuotes': profile['attributeQuotes'],
        // 'output.format': profile['format'] ?? true,
        // 'output.formatLeafNode': boolean,
        'output.formatSkip': ['html'],
        'output.formatForce': ['body'],
        // 'output.inlineBreak': profile['inlineBreak'],
        'output.compactBoolean': false,
        // 'output.booleanAttributes': string[],
        // 'output.reverseAttributes': boolean,
        // 'output.selfClosingStyle': profile['selfClosingStyle'],
        'output.field': exports.emmetSnippetField,
        // 'output.text': TextOutput,
        'comment.enabled': false,
        'comment.trigger': ['id', 'class'],
        'comment.before': '',
        'comment.after': '\n<!-- /[#ID][.CLASS] -->',
        'bem.enabled': false,
        'bem.element': '__',
        'bem.modifier': '_',
        'jsx.enabled': syntax === 'jsx',
        // 'stylesheet.keywords': string[],
        // 'stylesheet.unitless': string[],
        // 'stylesheet.shortHex': boolean,
        'stylesheet.between': ': ',
        'stylesheet.after': ';',
        'stylesheet.intUnit': 'px',
        'stylesheet.floatUnit': 'em',
        'stylesheet.unitAliases': { e: 'em', p: '%', x: 'ex', r: 'rem' },
        // 'stylesheet.json': boolean,
        // 'stylesheet.jsonDoubleQuotes': boolean,
        'stylesheet.fuzzySearchMinScore': 0.3,
    };
    const userPreferenceOptions = {
        // inlineElements: string[],
        // 'output.indent': string,
        // 'output.baseIndent': string,
        // 'output.newline': string,
        'output.tagCase': profile['tagCase'],
        'output.attributeCase': profile['attributeCase'],
        'output.attributeQuotes': profile['attributeQuotes'],
        'output.format': (_a = profile['format']) !== null && _a !== void 0 ? _a : true,
        // 'output.formatLeafNode': boolean,
        'output.formatSkip': preferences['format.noIndentTags'],
        'output.formatForce': preferences['format.forceIndentationForTags'],
        'output.inlineBreak': profile['inlineBreak'],
        'output.compactBoolean': (_b = profile['compactBooleanAttributes']) !== null && _b !== void 0 ? _b : preferences['profile.allowCompactBoolean'],
        // 'output.booleanAttributes': string[],
        // 'output.reverseAttributes': boolean,
        'output.selfClosingStyle': profile['selfClosingStyle'],
        'output.field': exports.emmetSnippetField,
        // 'output.text': TextOutput,
        'comment.enabled': commentEnabled,
        'comment.trigger': preferences['filter.commentTrigger'],
        'comment.before': preferences['filter.commentBefore'],
        'comment.after': preferences['filter.commentAfter'],
        'bem.enabled': bemEnabled,
        'bem.element': (_c = preferences['bem.elementSeparator']) !== null && _c !== void 0 ? _c : '__',
        'bem.modifier': (_d = preferences['bem.modifierSeparator']) !== null && _d !== void 0 ? _d : '_',
        'jsx.enabled': syntax === 'jsx',
        // 'stylesheet.keywords': string[],
        // 'stylesheet.unitless': string[],
        // 'stylesheet.shortHex': boolean,
        'stylesheet.between': preferences[`${stylesheetSyntax}.valueSeparator`],
        'stylesheet.after': preferences[`${stylesheetSyntax}.propertyEnd`],
        'stylesheet.intUnit': preferences['css.intUnit'],
        'stylesheet.floatUnit': preferences['css.floatUnit'],
        'stylesheet.unitAliases': unitAliases,
        // 'stylesheet.json': boolean,
        // 'stylesheet.jsonDoubleQuotes': boolean,
        'stylesheet.fuzzySearchMinScore': preferences['css.fuzzySearchMinScore'],
    };
    const combinedOptions = {};
    [...Object.keys(defaultVSCodeOptions), ...Object.keys(userPreferenceOptions)].forEach(key => {
        var _a;
        combinedOptions[key] = (_a = userPreferenceOptions[key]) !== null && _a !== void 0 ? _a : defaultVSCodeOptions[key];
    });
    const mergedAliases = Object.assign(Object.assign({}, defaultVSCodeOptions['stylesheet.unitAliases']), userPreferenceOptions['stylesheet.unitAliases']);
    combinedOptions['stylesheet.unitAliases'] = mergedAliases;
    const type = getSyntaxType(syntax);
    const variables = getVariables(emmetConfig['variables']);
    const baseSyntax = getDefaultSyntax(syntax);
    const snippets = (type === 'stylesheet') ?
        ((_e = customSnippetsRegistry[syntax]) !== null && _e !== void 0 ? _e : customSnippetsRegistry[baseSyntax]) :
        customSnippetsRegistry[syntax];
    return {
        type,
        options: combinedOptions,
        variables,
        snippets,
        syntax,
        // context: null,
        text: null,
        maxRepeat: 1000,
    };
}
exports.getExpandOptions = getExpandOptions;
function splitVendorPrefix(abbreviation) {
    if (!vendorPrefixesEnabled) {
        return {
            prefixOptions: '',
            abbreviationWithoutPrefix: abbreviation
        };
    }
    abbreviation = abbreviation || "";
    if (abbreviation[0] != '-') {
        return {
            prefixOptions: "",
            abbreviationWithoutPrefix: abbreviation
        };
    }
    else {
        abbreviation = abbreviation.substr(1);
        let pref = "-";
        if (/^[wmso]*-./.test(abbreviation)) {
            const index = abbreviation.indexOf("-");
            if (index > -1) {
                pref += abbreviation.substr(0, index + 1);
                abbreviation = abbreviation.substr(index + 1);
            }
        }
        return {
            prefixOptions: pref,
            abbreviationWithoutPrefix: abbreviation
        };
    }
}
function applyVendorPrefixes(expandedProperty, vendors, preferences) {
    if (!vendorPrefixesEnabled) {
        return expandedProperty;
    }
    preferences = preferences || {};
    expandedProperty = expandedProperty || "";
    vendors = vendors || "";
    if (vendors[0] !== '-') {
        return expandedProperty;
    }
    if (vendors == "-") {
        let defaultVendors = "-";
        const property = expandedProperty.substr(0, expandedProperty.indexOf(':'));
        if (!property) {
            return expandedProperty;
        }
        for (const v in vendorPrefixes) {
            const vendorProperties = preferences['css.' + vendorPrefixes[v] + 'Properties'];
            if (vendorProperties && vendorProperties.split(',').find(x => x.trim() === property))
                defaultVendors += v;
        }
        // If no vendors specified, add all
        vendors = defaultVendors == "-" ? "-wmso" : defaultVendors;
        vendors += '-';
    }
    vendors = vendors.substr(1);
    let prefixedProperty = "";
    for (let index = 0; index < vendors.length - 1; index++) {
        prefixedProperty += '-' + vendorPrefixes[vendors[index]] + '-' + expandedProperty + "\n";
    }
    return prefixedProperty + expandedProperty;
}
/**
 * Parses given abbreviation using given options and returns a tree
 * @param abbreviation string
 * @param options options used by the emmet module to parse given abbreviation
 */
function parseAbbreviation(abbreviation, options) {
    const resolvedOptions = emmet_1.resolveConfig(options);
    return (options.type === 'stylesheet') ?
        emmet_1.parseStylesheet(abbreviation, resolvedOptions) :
        emmet_1.parseMarkup(abbreviation, resolvedOptions);
}
exports.parseAbbreviation = parseAbbreviation;
/**
 * Expands given abbreviation using given options
 * @param abbreviation string or parsed abbreviation
 * @param config options used by the @emmetio/expand-abbreviation module to expand given abbreviation
 */
function expandAbbreviation(abbreviation, config) {
    let expandedText;
    const resolvedConfig = emmet_1.resolveConfig(config);
    if (config.type === 'stylesheet') {
        if (typeof abbreviation === 'string') {
            const { prefixOptions, abbreviationWithoutPrefix } = splitVendorPrefix(abbreviation);
            expandedText = emmet_1.default(abbreviationWithoutPrefix, resolvedConfig);
            expandedText = applyVendorPrefixes(expandedText, prefixOptions, resolvedConfig.options);
        }
        else {
            expandedText = emmet_1.stringifyStylesheet(abbreviation, resolvedConfig);
        }
    }
    else {
        if (typeof abbreviation === 'string') {
            expandedText = emmet_1.default(abbreviation, resolvedConfig);
        }
        else {
            expandedText = emmet_1.stringifyMarkup(abbreviation, resolvedConfig);
        }
    }
    return escapeNonTabStopDollar(addFinalTabStop(expandedText));
}
exports.expandAbbreviation = expandAbbreviation;
/**
 * Maps and returns syntaxProfiles of previous format to ones compatible with new emmet modules
 * @param syntax
 */
function getProfile(syntax, profilesFromSettings) {
    if (!profilesFromSettings) {
        profilesFromSettings = {};
    }
    const profilesConfig = Object.assign({}, profilesFromFile, profilesFromSettings);
    const options = profilesConfig[syntax];
    if (!options || typeof options === 'string') {
        if (options === 'xhtml') {
            return {
                selfClosingStyle: 'xhtml'
            };
        }
        return {};
    }
    const newOptions = {};
    for (const key in options) {
        switch (key) {
            case 'tag_case':
                newOptions['tagCase'] = (options[key] === 'lower' || options[key] === 'upper') ? options[key] : '';
                break;
            case 'attr_case':
                newOptions['attributeCase'] = (options[key] === 'lower' || options[key] === 'upper') ? options[key] : '';
                break;
            case 'attr_quotes':
                newOptions['attributeQuotes'] = options[key];
                break;
            case 'tag_nl':
                newOptions['format'] = (options[key] === true || options[key] === false) ? options[key] : true;
                break;
            case 'inline_break':
                newOptions['inlineBreak'] = options[key];
                break;
            case 'self_closing_tag':
                if (options[key] === true) {
                    newOptions['selfClosingStyle'] = 'xml';
                    break;
                }
                if (options[key] === false) {
                    newOptions['selfClosingStyle'] = 'html';
                    break;
                }
                newOptions['selfClosingStyle'] = options[key];
                break;
            case 'compact_bool':
                newOptions['compactBooleanAttributes'] = options[key];
                break;
            default:
                newOptions[key] = options[key];
                break;
        }
    }
    return newOptions;
}
/**
 * Returns variables to be used while expanding snippets
 */
function getVariables(variablesFromSettings) {
    if (!variablesFromSettings) {
        return variablesFromFile;
    }
    return Object.assign({}, variablesFromFile, variablesFromSettings);
}
function getFormatters(syntax, preferences) {
    if (!preferences) {
        return {};
    }
    if (!isStyleSheet(syntax)) {
        const commentFormatter = {};
        for (const key in preferences) {
            switch (key) {
                case 'filter.commentAfter':
                    commentFormatter['after'] = preferences[key];
                    break;
                case 'filter.commentBefore':
                    commentFormatter['before'] = preferences[key];
                    break;
                case 'filter.commentTrigger':
                    commentFormatter['trigger'] = preferences[key];
                    break;
                default:
                    break;
            }
        }
        return {
            comment: commentFormatter
        };
    }
    let fuzzySearchMinScore = typeof preferences['css.fuzzySearchMinScore'] === 'number' ? preferences['css.fuzzySearchMinScore'] : 0.3;
    if (fuzzySearchMinScore > 1) {
        fuzzySearchMinScore = 1;
    }
    else if (fuzzySearchMinScore < 0) {
        fuzzySearchMinScore = 0;
    }
    const stylesheetFormatter = {
        'fuzzySearchMinScore': fuzzySearchMinScore
    };
    for (const key in preferences) {
        switch (key) {
            case 'css.floatUnit':
                stylesheetFormatter['floatUnit'] = preferences[key];
                break;
            case 'css.intUnit':
                stylesheetFormatter['intUnit'] = preferences[key];
                break;
            case 'css.unitAliases':
                const unitAliases = {};
                preferences[key].split(',').forEach(alias => {
                    if (!alias || !alias.trim() || !alias.includes(':')) {
                        return;
                    }
                    const aliasName = alias.substr(0, alias.indexOf(':'));
                    const aliasValue = alias.substr(aliasName.length + 1);
                    if (!aliasName.trim() || !aliasValue) {
                        return;
                    }
                    unitAliases[aliasName.trim()] = aliasValue;
                });
                stylesheetFormatter['unitAliases'] = unitAliases;
                break;
            case `${syntax}.valueSeparator`:
                stylesheetFormatter['between'] = preferences[key];
                break;
            case `${syntax}.propertyEnd`:
                stylesheetFormatter['after'] = preferences[key];
                break;
            default:
                break;
        }
    }
    return {
        stylesheet: stylesheetFormatter
    };
}
/**
 * Updates customizations from snippets.json and syntaxProfiles.json files in the directory configured in emmet.extensionsPath setting
 */
function updateExtensionsPath(emmetExtensionsPath, fs, workspaceFolderPath, homeDir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (emmetExtensionsPath) {
            emmetExtensionsPath = emmetExtensionsPath.trim();
        }
        if (!emmetExtensionsPath) {
            resetSettingsFromFile();
            return Promise.resolve();
        }
        let emmetExtensionsPathUri;
        if (emmetExtensionsPath[0] === '~') {
            if (homeDir) {
                emmetExtensionsPathUri = fileService_1.joinPath(homeDir, emmetExtensionsPath.substr(1));
            }
        }
        else if (!fileService_1.isAbsolutePath(emmetExtensionsPath)) {
            if (workspaceFolderPath) {
                emmetExtensionsPathUri = fileService_1.joinPath(workspaceFolderPath, emmetExtensionsPath);
            }
        }
        else {
            emmetExtensionsPathUri = vscode_uri_1.URI.file(emmetExtensionsPath);
        }
        try {
            // the fs.stat call itself could throw, so we wrap this part up into a try-catch
            if (!emmetExtensionsPathUri || (yield fs.stat(emmetExtensionsPathUri)).type !== fileService_1.FileType.Directory) {
                throw new Error();
            }
        }
        catch (e) {
            resetSettingsFromFile();
            throw new Error(`The directory ${emmetExtensionsPath} doesn't exist. Update emmet.extensionsPath setting`);
        }
        const snippetsPath = fileService_1.joinPath(emmetExtensionsPathUri, 'snippets.json');
        const profilesPath = fileService_1.joinPath(emmetExtensionsPathUri, 'syntaxProfiles.json');
        try {
            const snippetsData = yield fs.readFile(snippetsPath);
            const snippetsDataStr = new util_1.TextDecoder().decode(snippetsData);
            const errors = [];
            const snippetsJson = JSONC.parse(snippetsDataStr, errors);
            if (errors.length > 0) {
                throw new Error(`Found error ${JSONC.printParseErrorCode(errors[0].error)} while parsing the file ${snippetsPath} at offset ${errors[0].offset}`);
            }
            variablesFromFile = snippetsJson['variables'];
            customSnippetsRegistry = {};
            snippetKeyCache.clear();
            Object.keys(snippetsJson).forEach(syntax => {
                if (!snippetsJson[syntax]['snippets']) {
                    return;
                }
                const baseSyntax = getDefaultSyntax(syntax);
                let customSnippets = snippetsJson[syntax]['snippets'];
                if (snippetsJson[baseSyntax] && snippetsJson[baseSyntax]['snippets'] && baseSyntax !== syntax) {
                    customSnippets = Object.assign({}, snippetsJson[baseSyntax]['snippets'], snippetsJson[syntax]['snippets']);
                }
                if (!isStyleSheet(syntax)) {
                    // In Emmet 2.0 all snippets should be valid abbreviations
                    // Convert old snippets that do not follow this format to new format
                    for (const snippetKey in customSnippets) {
                        if (customSnippets.hasOwnProperty(snippetKey)
                            && customSnippets[snippetKey].startsWith('<')
                            && customSnippets[snippetKey].endsWith('>')) {
                            customSnippets[snippetKey] = `{${customSnippets[snippetKey]}}`;
                        }
                    }
                }
                else {
                    stylesheetCustomSnippetsKeyCache.set(syntax, Object.keys(customSnippets));
                }
                customSnippetsRegistry[syntax] = configCompat_1.parseSnippets(customSnippets);
                const snippetKeys = Object.keys(customSnippetsRegistry[syntax]);
                snippetKeyCache.set(syntax, snippetKeys);
            });
        }
        catch (e) {
            resetSettingsFromFile();
            throw new Error(`Error while parsing the file ${snippetsPath}`);
        }
        try {
            const profilesData = yield fs.readFile(profilesPath);
            const profilesDataStr = new util_1.TextDecoder().decode(profilesData);
            profilesFromFile = JSON.parse(profilesDataStr);
        }
        catch (e) {
            // 
        }
    });
}
exports.updateExtensionsPath = updateExtensionsPath;
function resetSettingsFromFile() {
    customSnippetsRegistry = {};
    snippetKeyCache.clear();
    stylesheetCustomSnippetsKeyCache.clear();
    profilesFromFile = {};
    variablesFromFile = {};
}
/**
* Get the corresponding emmet mode for given vscode language mode
* Eg: jsx for typescriptreact/javascriptreact or pug for jade
* If the language is not supported by emmet or has been exlcuded via `exlcudeLanguages` setting,
* then nothing is returned
*
* @param language
* @param exlcudedLanguages Array of language ids that user has chosen to exlcude for emmet
*/
function getEmmetMode(language, excludedLanguages = []) {
    if (!language || excludedLanguages.includes(language)) {
        return;
    }
    if (/\b(typescriptreact|javascriptreact|jsx-tags)\b/.test(language)) { // treat tsx like jsx
        return 'jsx';
    }
    if (language === 'sass-indented') { // map sass-indented to sass
        return 'sass';
    }
    if (language === 'jade') {
        return 'pug';
    }
    if (configCompat_1.syntaxes.markup.includes(language) || configCompat_1.syntaxes.stylesheet.includes(language)) {
        return language;
    }
}
exports.getEmmetMode = getEmmetMode;
const propertyHexColorRegex = /^[a-zA-Z]+:?#[\d.a-fA-F]{0,6}$/;
const hexColorRegex = /^#[\d,a-f,A-F]{1,6}$/;
const onlyLetters = /^[a-z,A-Z]+$/;
/**
 * Returns a completion participant for Emmet of the form {
 * 		onCssProperty: () => void
 * 		onCssPropertyValue: () => void
 * 		onHtmlContent: () => void
 * }
 * @param document The TextDocument for which completions are being provided
 * @param position The Position in the given document where completions are being provided
 * @param syntax The Emmet syntax to use when providing Emmet completions
 * @param emmetSettings The Emmet settings to use when providing Emmet completions
 * @param result The Completion List object that needs to be updated with Emmet completions
 */
function getEmmetCompletionParticipants(document, position, syntax, emmetSettings, result) {
    return {
        getId: () => 'emmet',
        onCssProperty: (context) => {
            if (context && context.propertyName) {
                const currentresult = doComplete(document, position, syntax, emmetSettings);
                if (result && currentresult) {
                    result.items = currentresult.items;
                    result.isIncomplete = true;
                }
            }
        },
        onCssPropertyValue: (context) => {
            if (context && context.propertyValue) {
                const extractOptions = { lookAhead: false, type: 'stylesheet' };
                const extractedResults = extractAbbreviation(document, position, extractOptions);
                if (!extractedResults) {
                    return;
                }
                const validAbbreviationWithColon = extractedResults.abbreviation === `${context.propertyName}:${context.propertyValue}` && onlyLetters.test(context.propertyValue);
                if (validAbbreviationWithColon // Allows abbreviations like pos:f
                    || hexColorRegex.test(extractedResults.abbreviation)
                    || extractedResults.abbreviation === '!') {
                    const currentresult = doComplete(document, position, syntax, emmetSettings);
                    if (result && currentresult) {
                        result.items = currentresult.items;
                        result.isIncomplete = true;
                    }
                }
            }
        },
        onHtmlContent: () => {
            const currentresult = doComplete(document, position, syntax, emmetSettings);
            if (result && currentresult) {
                result.items = currentresult.items;
                result.isIncomplete = true;
            }
        }
    };
}
exports.getEmmetCompletionParticipants = getEmmetCompletionParticipants;
//# sourceMappingURL=emmetHelper.js.map