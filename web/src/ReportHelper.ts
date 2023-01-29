import { ILibrary, IOccurrence, IReport, IReportApplication, IReportModule } from "../../server/src/core/interfaces";
import ConfigurationsHelper from "./ConfigurationsHelper";

class ReportHelper {
  public getOccurrencesPerVersion(occurrences: IOccurrence[]): { [version: string]: IOccurrence[] } {
    const result: { [version: string]: IOccurrence[] } = {};
    for (const occurrence of occurrences) {
      if (this.isOccurrencesFullDisabled(occurrence)) {
        continue;
      }
      const version = occurrence.libraryInfo.version;
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
      versions.add(occ.libraryInfo.version);
    }
    return versions;
  }

  public fetchConfigurationPerLibrariesAndVersion(report: IReport): IConfigurationsPerVersion {
    const result: IConfigurationsPerVersion = new Map<string, { libraryInfo: ILibrary; configurations: Set<string> }>();
    for (const app of Object.values(report.applications)) {
      for (const module of Object.values(app.modules)) {
        for (const occ of module.occurrences) {
          if (this.isOccurrencesFullDisabled(occ)) {
            continue;
          }
          const libAndVersion = `${occ.libraryInfo.name}:${occ.libraryInfo.versionPart}`;
          if (!result.has(libAndVersion)) {
            result.set(libAndVersion, { libraryInfo: occ.libraryInfo, configurations: new Set<string>() });
          }
          occ.configurations.filter((c) => ConfigurationsHelper.isEnabled(c)).forEach((c) => result.get(libAndVersion)!.configurations.add(c));
        }
      }
    }
    return result;
  }

  public isOccurrencesFullDisabled(occ: IOccurrence) {
    for (const c of occ.configurations) {
      if (ConfigurationsHelper.isEnabled(c)) {
        return false;
      }
    }
    return true;
  }
}
type IConfigurationsPerVersion = Map<string, { libraryInfo: ILibrary; configurations: Set<string> }>;

export default new ReportHelper();
