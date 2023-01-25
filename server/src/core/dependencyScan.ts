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

  constructor(private options: ICommandOptions, private console: IConsole) {}

  public async scan(): Promise<void> {
    const outputDir = join(process.cwd(), "_javaDependencerOutput");
    this.console.log(`See folder ${outputDir} for reports`);
    this.createOutputdir(outputDir);
    if (!this.options.doNotScan) {
      const fileToDelete = await readdir(outputDir);
      for (const file of fileToDelete) {
        this.console.log(`Remove old file/dir ${file}`);
        rmSync(join(outputDir, file), { recursive: true });
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
        if (this.options.doNotScan || (await this.scanModule(dirname(moduleGradle), join(outputDir, appName)))) {
          moduleNames.push(basename(dirname(moduleGradle)));
        }
      }
      this.appStructure[appName] = moduleNames;
    }
    this.console.log("Done");
  }

  public search(library: string): IReport {
    const outputDir = join(process.cwd(), "_javaDependencerOutput");
    const allUsedVersions = new Set<string>();
    const report: IReport = {
      applications: {},
      allUsedVersions: [],
    };
    for (const appName of Object.keys(this.appStructure)) {
      const appUsedVersions = new Set<string>();
      const moduleReports: { [moduleName: string]: IReportModule } = {};
      for (const moduleName of this.appStructure[appName]) {
        const moduleReport = this.searchModule(moduleName, join(outputDir, appName), library);
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
