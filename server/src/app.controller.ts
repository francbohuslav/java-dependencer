import { Controller, Get, Query } from "@nestjs/common";
import { DependencyScan } from "./core/dependencyScan";
import { IReport } from "./core/interfaces";

@Controller()
export class AppController {
  @Get()
  getReport(@Query("library") library: string): IReport | null {
    if (!library || library.length < 3) {
      throw new Error("Term must be at least 3 letters long");
    }
    return DependencyScan.Instance.search(library);
  }

  @Get("searchLibrary")
  searchLibrary(@Query("term") term: string): string[] {
    if (!term || term.length < 3) {
      throw new Error("Term must be at least 3 letters long");
    }
    return DependencyScan.Instance.getAllLibraries(term);
  }

  @Get("getModuleReport")
  getModuleReport(@Query("appName") appName: string, @Query("moduleName") moduleName: string): string {
    return DependencyScan.Instance.getRawModuleReport(appName, moduleName);
  }
}
