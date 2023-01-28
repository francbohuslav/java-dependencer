import { IOccurrence, IReport, IReportApplication, IReportModule } from "../../server/src/core/interfaces";

class ReportHelper {
  public getOccurrencesPerVersion(occurrences: IOccurrence[]): { [version: string]: IOccurrence[] } {
    const result: { [version: string]: IOccurrence[] } = {};
    for (const occurrence of occurrences) {
      const version = occurrence.version;
      if (!result[version]) {
        result[version] = [];
      }
      result[version].push(occurrence);
    }
    return result;
  }

  public fetchAllVersions(report: IReport): Set<string> {
    const versions = new Set<string>();
    for (const app of Object.values(report.applications)) {
      this.fetchAppVersions(app, versions);
    }
    return versions;
  }

  public fetchAppVersions(report: IReportApplication, versions: Set<string> = new Set<string>()): Set<string> {
    versions = versions || new Set<string>();
    for (const module of Object.values(report.modules)) {
      this.fetchModuleVersions(module, versions);
    }
    return versions;
  }

  public fetchModuleVersions(module: IReportModule, versions: Set<string> = new Set<string>()) {
    versions = versions || new Set<string>();
    for (const occ of module.occurrences) {
      versions.add(occ.version);
    }
    return versions;
  }

  public fetchConfigurationPerLibrariesAndVersion(report: IReport): IConfigurationsPerVersion {
    const result: IConfigurationsPerVersion = new Map<string, Set<string>>();
    for (const app of Object.values(report.applications)) {
      for (const module of Object.values(app.modules)) {
        for (const occ of module.occurrences) {
          const libAndVersion = occ.library + ":" + occ.versionPart;
          if (!result.has(libAndVersion)) {
            result.set(libAndVersion, new Set<string>());
          }
          result.get(libAndVersion)?.add(occ.configuration);
        }
      }
    }
    return result;
  }
}
type IConfigurationsPerVersion = Map<string, Set<string>>;

export default new ReportHelper();
