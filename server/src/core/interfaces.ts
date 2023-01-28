export interface INode {
  library: string;
  versionPart: string;
  configuration: string;
  level: number;
  hypens: string;
  childNodes: INode[];
}
export type ILibraryPath = string[];

export interface IConsole {
  log(...args: any[]): void;
  error(...args: any[]): void;
}

export interface IOccurrence {
  configuration: string;
  library: string;
  /** E.g. 2.8.1 -> 2.9.6 */
  versionPart: string;
  version: string;
  usedBy: string[];
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

export type ICollisonCollector = { [library: string]: Set<string> };
export type ICollisionReport = { [library: string]: string[] };
