import { parse } from '@babel/parser';
import {
  Declaration,
  DeclareExportAllDeclaration,
  DeclareExportDeclaration,
  DeclareModule,
  DeclareModuleExports,
  ExportNamedDeclaration,
  Identifier,
  ModuleDeclaration,
  Statement,
  TSModuleDeclaration,
} from '@babel/types';

/**
 * Description placeholder
 * @date 10/8/2022 - 11:13:21 PM
 *
 * @typedef {ExportableDeclaration}
 */
type ExportableDeclaration = Exclude<
  Declaration,
  | ModuleDeclaration
  | TSModuleDeclaration
  | DeclareModule
  | DeclareExportDeclaration
  | DeclareExportAllDeclaration
  | DeclareModuleExports
>;

/**
 * A parser parses the provided document as an entire ECMAScript program.
 */
export default class Parser {
  /**
   * Description placeholder
   * @date 10/8/2022 - 11:13:21 PM
   *
   * @readonly
   * @type {{}}
   */
  readonly exportableDeclarations = [
    'FunctionDeclaration',
    'VariableDeclaration',
    'ClassDeclaration',
    'DeclareClass',
    'DeclareFunction',
    'DeclareInterface',
    'DeclareTypeAlias',
    'DeclareOpaqueType',
    'DeclareVariable',
    'InterfaceDeclaration',
    'OpaqueType',
    'TypeAlias',
    'EnumDeclaration',
    'TSDeclareFunction',
    'TSInterfaceDeclaration',
    'TSTypeAliasDeclaration',
    'TSEnumDeclaration',
    // "TSModuleDeclaration",
    // "DeclareModule",
    // "DeclareExportDeclaration",
    // "DeclareExportAllDeclaration",
    // "DeclareModuleExports",
  ];

  /**
   * Description placeholder
   * @date 10/8/2022 - 11:13:21 PM
   *
   * @readonly
   * @type {string}
   */
  readonly _document: string;
  /**
   * Description placeholder
   * @date 10/8/2022 - 11:13:21 PM
   *
   * @readonly
   * @type {Statement[]}
   */
  readonly _statements: Statement[];

  /**
   * Creates an instance of Parser.
   * @date 10/8/2022 - 11:13:21 PM
   *
   * @constructor
   * @param {string} document
   */
  constructor(document: string) {
    this._document = document;
    this._statements = this.getStatements(this._document);
  }

  /**
   * Parse document with `@babel/parser.
   *
   * @param document String of code.
   * @return array of `Statement`
   */
  getStatements(document: string): Statement[] {
    const parsed = parse(document, {
      sourceType: 'unambiguous',
      plugins: ['typescript'],
    });
    return parsed.program.body;
  }

  /**
   * Find name of `node` and return it.
   * If the type of node is `VariableDeclaration`, it will map a declarations property of node and find name in id.
   * Otherwise, it will just find name in id property.
   *
   * @param document String of code.
   * @return An array of name or just single name.
   */
  getVariableName(node: ExportableDeclaration): string | string[] {
    if (node.type === 'VariableDeclaration') {
      return node.declarations.map(
        (declaration) => (declaration.id as Identifier).name
      );
    } else {
      return node.id!.name;
    }
  }

  /**
   * Description placeholder
   * @date 10/8/2022 - 11:13:21 PM
   *
   * @returns {*}
   */
  getExportNamedDeclarations() {
    return this._statements.filter(
      (statement): statement is ExportNamedDeclaration =>
        statement.type === 'ExportNamedDeclaration' &&
        statement.declaration === null &&
        statement.specifiers.length > 0
    );
  }

  /**
   * Description placeholder
   * @date 10/8/2022 - 11:13:21 PM
   *
   * @returns {*}
   */
  getNamedExportedVariables() {
    const exportedVariables = this.getExportNamedDeclarations();

    return exportedVariables
      .filter((exportedVariable) => exportedVariable.declaration)
      .map((exportedVariable) =>
        this.getVariableName(
          exportedVariable.declaration as ExportableDeclaration
        )
      )
      .flat();
  }

  /**
   * Description placeholder
   * @date 10/8/2022 - 11:13:21 PM
   *
   * @returns {ExportableDeclaration[]}
   */
  getExportableStatements(): ExportableDeclaration[] {
    return this._statements.filter(
      (statement): statement is ExportableDeclaration =>
        this.exportableDeclarations.includes(statement.type)
    );
  }

  /**
   * Description placeholder
   * @date 10/8/2022 - 11:13:21 PM
   *
   * @param {ExportableDeclaration[]} nodes
   * @returns {{}}
   */
  getVariablesName(nodes: ExportableDeclaration[]) {
    return [...new Set(nodes.map((node) => this.getVariableName(node)).flat())];
  }

  /**
   * Description placeholder
   * @date 10/8/2022 - 11:13:21 PM
   *
   * @param {string[]} names
   * @returns {string}
   */
  getNamedExportStatement(names: string[]) {
    return `export { ${names.join(', ')} }`;
  }
}
