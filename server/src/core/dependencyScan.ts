import { exec } from "child_process";
import { existsSync, mkdirSync, rmSync } from "fs";
import { readdir } from "fs/promises";
import { glob } from "glob";
import { basename, dirname, join, resolve, sep } from "path";
import { promisify } from "util";
import core from "./core";
import { DependencyCollector } from "./dependencyCollector";
import { DependencyReportParser } from "./dependencyReportParser";
import { ICommandOptions, IConsole, IReport, IReportApplication, IReportModule } from "./interfaces";

const globAsync = promisify(glob);

export class DependencyScan {
  static Instance: DependencyScan = null;

  private appStructure: { [app: string]: string[] } = {};

  private outputDir = join(process.cwd(), "_javaDependencerOutput");

  constructor(private options: ICommandOptions, private console: IConsole) {}

  public async scan(): Promise<void> {
    this.console.log(`See folder ${this.outputDir} for reports`);
    this.createOutputdir(this.outputDir);
    if (!this.options.doNotScan) {
      const fileToDelete = await readdir(this.outputDir);
      for (const file of fileToDelete) {
        this.console.log(`Remove old file/dir ${file}`);
        rmSync(join(this.outputDir, file), { recursive: true });
      }
    }
    this.appStructure = {};
    for (const appFolder of this.options.appFolder) {
      // Only first level is scanned
      const filter = join(appFolder, "*/build.gradle").replace(/\\/g, "/");
      const moduleGradles = await globAsync(filter);
      const appName = basename(resolve(appFolder));
      this.console.log("App", appName);
      const moduleNames: string[] = [];
      for (const moduleGradle of moduleGradles) {
        if (this.options.doNotScan || (await this.scanModule(dirname(moduleGradle), join(this.outputDir, appName)))) {
          moduleNames.push(basename(dirname(moduleGradle)));
        }
      }
      this.appStructure[appName] = moduleNames;
    }
    this.console.log("Done");
  }

  public getAllLibraries(term: string): string[] {
    const allUsedLibraries = new Set<string>();
    for (const appName of Object.keys(this.appStructure)) {
      for (const moduleName of this.appStructure[appName]) {
        this.getModuleLibraries(moduleName, join(this.outputDir, appName), allUsedLibraries, term);
      }
    }
    const result = [...allUsedLibraries];
    result.sort();
    return result;
  }

  public search(library: string): IReport {
    const allUsedVersions = new Set<string>();
    const report: IReport = {
      applications: {},
      allUsedVersions: [],
    };
    for (const appName of Object.keys(this.appStructure)) {
      const appUsedVersions = new Set<string>();
      const moduleReports: { [moduleName: string]: IReportModule } = {};
      for (const moduleName of this.appStructure[appName]) {
        const moduleReport = this.searchModule(moduleName, join(this.outputDir, appName), library);
        if (moduleReport) {
          for (const version of moduleReport.allUsedVersions) {
            appUsedVersions.add(version);
            allUsedVersions.add(version);
          }
          moduleReports[moduleName] = moduleReport;
        }
      }
      const appReport: IReportApplication = {
        allUsedVersions: [...appUsedVersions],
        modules: moduleReports,
      };
      report.applications[appName] = appReport;
    }
    report.allUsedVersions = [...allUsedVersions];
    report.allUsedVersions.sort();
    return report;
  }

  public getRawModuleReport(appName: string, moduleName: string): string {
    const outputPath = join(this.outputDir, appName, moduleName + ".txt");
    return core.readTextFile(outputPath);
  }

  private createOutputdir(outputDir: string) {
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir);
    }
  }

  private async scanModule(moduleFolder: string, outputDir: string): Promise<boolean> {
    try {
      this.console.log(" -", moduleFolder);
      this.createOutputdir(outputDir);
      let output = "";
      const outputPath = join(outputDir, basename(moduleFolder) + ".txt");
      output = await this.execWithoutError(".." + sep + "gradlew dependencies", moduleFolder);
      core.writeTextFile(outputPath, output);
      return true;
    } catch (err) {
      this.console.error(err);
      return false;
    }
  }

  private searchModule(moduleName: string, outputDir: string, library: string): IReportModule | undefined {
    try {
      const outputPath = join(outputDir, moduleName + ".txt");
      const output = core.readTextFile(outputPath);
      const parser = new DependencyReportParser(this.console);
      const nodes = parser.parse(output);

      const collector = new DependencyCollector();
      const occurrences = collector.collect(nodes, library);
      return {
        allUsedVersions: [...new Set(occurrences.map((o) => o.library))],
        occurrences,
      };
    } catch (err) {
      this.console.error(err);
      return undefined;
    }
  }

  getModuleLibraries(moduleName: string, outputDir: string, allUsedLibraries: Set<string>, library: string) {
    try {
      const outputPath = join(outputDir, moduleName + ".txt");
      const output = core.readTextFile(outputPath);
      const parser = new DependencyReportParser(this.console);
      const nodes = parser.parse(output);

      const collector = new DependencyCollector();
      collector.collectLibraries(nodes, allUsedLibraries, library);
    } catch (err) {
      this.console.error(err);
      return undefined;
    }
  }

  async execWithoutError(command: string, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, { cwd }, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  }

  /**
   * Original dependency file is not consistent. Fix that to compare it with testing output.
   */
  private normalizeOutput(output: string) {
    let prevOutput = output;
    do {
      prevOutput = output;
      output = output.replace(/         /g, "    |    ");
      output = output.replace(/^     /gm, "|    ");
    } while (prevOutput != output);
    do {
      prevOutput = output;
      output = output.replace(/^    ([|+\\])/gm, "|    $1");
    } while (prevOutput != output);
    do {
      prevOutput = output;
      output = output.replace(/\|     ([|+\\])/gm, "|    $1");
    } while (prevOutput != output);
    return output;
  }
}
