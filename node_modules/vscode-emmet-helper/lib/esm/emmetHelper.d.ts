import { Position, Range, CompletionList } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { FileService, FileType, FileStat } from './fileService';
import { ExtractOptions, MarkupAbbreviation, StylesheetAbbreviation, SyntaxType, UserConfig } from 'emmet';
import { SnippetsMap } from './configCompat';
export { FileService, FileType, FileStat };
/**
 * Emmet configuration as derived from the Emmet related VS Code settings
 */
export interface VSCodeEmmetConfig {
    showExpandedAbbreviation?: string;
    showAbbreviationSuggestions?: boolean;
    syntaxProfiles?: object;
    variables?: object;
    preferences?: object;
    excludeLanguages?: string[];
    showSuggestionsAsSnippets?: boolean;
}
/**
 * Returns all applicable emmet expansions for abbreviation at given position in a CompletionList
 * @param document TextDocument in which completions are requested
 * @param position Position in the document at which completions are requested
 * @param syntax Emmet supported language
 * @param emmetConfig Emmet Configurations as derived from VS Code
 */
export declare function doComplete(document: TextDocument, position: Position, syntax: string, emmetConfig: VSCodeEmmetConfig): CompletionList;
export declare const emmetSnippetField: (index: any, placeholder: any) => string;
/** Returns whether or not syntax is a supported stylesheet syntax, like CSS */
export declare function isStyleSheet(syntax: string): boolean;
/** Returns the syntax type, either markup (e.g. for HTML) or stylesheet (e.g. for CSS) */
export declare function getSyntaxType(syntax: string): SyntaxType;
/** Returns the default syntax (html or css) to use for the snippets registry */
export declare function getDefaultSyntax(syntax: string): string;
/** Returns the default snippets that Emmet suggests */
export declare function getDefaultSnippets(syntax: string): SnippetsMap;
/**
 * Extracts abbreviation from the given position in the given document
 * @param document The TextDocument from which abbreviation needs to be extracted
 * @param position The Position in the given document from where abbreviation needs to be extracted
 * @param options The options to pass to the @emmetio/extract-abbreviation module
 */
export declare function extractAbbreviation(document: TextDocument, position: Position, options?: Partial<ExtractOptions>): {
    abbreviation: string;
    abbreviationRange: Range;
    filter: string;
};
/**
 * Extracts abbreviation from the given text
 * @param text Text from which abbreviation needs to be extracted
 * @param syntax Syntax used to extract the abbreviation from the given text
 */
export declare function extractAbbreviationFromText(text: string, syntax?: string): {
    abbreviation: string;
    filter: string;
};
/**
 * Returns a boolean denoting validity of given abbreviation in the context of given syntax
 * Not needed once https://github.com/emmetio/atom-plugin/issues/22 is fixed
 * @param syntax string
 * @param abbreviation string
 */
export declare function isAbbreviationValid(syntax: string, abbreviation: string): boolean;
/**
 * Returns options to be used by emmet
 */
export declare function getExpandOptions(syntax: string, emmetConfig?: VSCodeEmmetConfig, filter?: string): UserConfig;
/**
 * Parses given abbreviation using given options and returns a tree
 * @param abbreviation string
 * @param options options used by the emmet module to parse given abbreviation
 */
export declare function parseAbbreviation(abbreviation: string, options: UserConfig): StylesheetAbbreviation | MarkupAbbreviation;
/**
 * Expands given abbreviation using given options
 * @param abbreviation string or parsed abbreviation
 * @param config options used by the @emmetio/expand-abbreviation module to expand given abbreviation
 */
export declare function expandAbbreviation(abbreviation: string | MarkupAbbreviation | StylesheetAbbreviation, config: UserConfig): string;
/**
 * Updates customizations from snippets.json and syntaxProfiles.json files in the directory configured in emmet.extensionsPath setting
 */
export declare function updateExtensionsPath(emmetExtensionsPath: string | undefined | null, fs: FileService, workspaceFolderPath?: URI, homeDir?: URI): Promise<void>;
/**
* Get the corresponding emmet mode for given vscode language mode
* Eg: jsx for typescriptreact/javascriptreact or pug for jade
* If the language is not supported by emmet or has been exlcuded via `exlcudeLanguages` setting,
* then nothing is returned
*
* @param language
* @param exlcudedLanguages Array of language ids that user has chosen to exlcude for emmet
*/
export declare function getEmmetMode(language: string, excludedLanguages?: string[]): string | undefined;
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
export declare function getEmmetCompletionParticipants(document: TextDocument, position: Position, syntax: string, emmetSettings: VSCodeEmmetConfig, result: CompletionList): any;
