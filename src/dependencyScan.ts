import { exec } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { glob } from "glob";
import { basename, dirname, join, resolve } from "path";
import { promisify } from "util";
import core from "./core";
import { DependencyCollector } from "./dependencyCollector";
import { DependencyReportParser } from "./dependencyReportParser";
import { ICommandOptions, IConsole, IReport, IReportApplication, IReportModule } from "./interfaces";

const globAsync = promisify(glob);

export class DependencyScan {
  constructor(private options: ICommandOptions, private console: IConsole) {}

  async run(): Promise<void> {
    this.console.log(`Searching ${this.options.dependency}`);

    const outputDir = join(process.cwd(), "_javaDependencerOutput");
    this.console.log(`See folder ${outputDir} for reports`);

    this.createOutputdir(outputDir);

    const allUsedVersions = new Set<string>();
    const report: IReport = {
      applications: {},
      allUsedVersions: [],
    };
    for (const appFolder of this.options.appFolder) {
      // Only first level is scanned
      const filter = join(appFolder, "*/build.gradle").replace(/\\/g, "/");
      let moduleGradles = await globAsync(filter);
      const appUsedVersions = new Set<string>();
      const appName = basename(resolve(appFolder));
      this.console.log("App", appName);
      const moduleReports: { [moduleName: string]: IReportModule } = {};
      for (const moduleGradle of moduleGradles) {
        // .slice(0, 1)
        const moduleName = basename(resolve(dirname(moduleGradle)));
        const moduleReport = await this.processModule(dirname(moduleGradle), join(outputDir, appName));
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
    core.writeTextFile(join(outputDir, "report.json"), JSON.stringify(report, null, 2));
    this.console.log("Done");
  }

  private createOutputdir(outputDir: string) {
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir);
    }
  }

  async processModule(moduleFolder: string, outputDir: string): Promise<IReportModule | undefined> {
    try {
      this.console.log(" -", moduleFolder);
      this.createOutputdir(outputDir);
      let output = "";
      const outputPath = join(outputDir, basename(moduleFolder) + ".txt");
      if (this.options.useExistingOutput && existsSync(outputPath)) {
        output = core.readTextFile(outputPath);
      } else {
        output = await this.execWithoutError("..\\gradlew.bat dependencies", moduleFolder);
        core.writeTextFile(outputPath, output);
      }
      const parser = new DependencyReportParser(this.console);
      const nodes = parser.parse(output);

      const collector = new DependencyCollector();
      const occurrences = collector.collect(nodes, this.options.dependency);
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
      exec(command, { cwd }, (error, stdout, stderr) => {
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
