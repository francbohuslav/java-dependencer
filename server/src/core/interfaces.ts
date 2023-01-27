export interface INode {
  library: string;
  version: string;
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
  library: string;
  usedBy: string[];
}

export interface IReport {
  allUsedVersions: string[];
  applications: { [appName: string]: IReportApplication };
}

export interface IReportApplication {
  allUsedVersions: string[];
  modules: { [moduleName: string]: IReportModule };
}

export interface IReportModule {
  allUsedVersions: string[];
  occurrences: IOccurrence[];
}
