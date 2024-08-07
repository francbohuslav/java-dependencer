export interface INode {
  libraryInfo: ILibrary;
  configuration: string;
  level: number;
  hypens: string;
  childNodes: INode[];
}

export interface IConsole {
  log(...args: any[]): void;
  error(...args: any[]): void;
}

export interface IOccurrence {
  configurations: string[];
  libraryInfo: ILibrary;
  usedBy: ILibrary[];
}

export interface IReport {
  applications: { [appName: string]: IReportApplication };
}

export interface IReportApplication {
  modules: { [moduleName: string]: IReportModule };
}

export interface IReportModule {
  occurrences: IOccurrence[];
}

export type ICollisionCollector = { [library: string]: Set<string> };
export type ICollisionReport = { [library: string]: string[] };

export interface ILibrary {
  name: string;
  /** E.g. 2.8.1 -> 2.9.6 */
  versionPart: string;
  version: string;
  info: LibraryInfoEnum;
}

export enum LibraryInfoEnum {
  LetterC = "c",
  LetterN = "n",
  Asterisk = "*",
  None = "",
}
