import { Controller, Get, Query } from "@nestjs/common";
import { DependencyScan } from "./core/dependencyScan";
import { IReport } from "./core/interfaces";

@Controller()
export class AppController {
  @Get()
  getReport(@Query("term") term: string): IReport | null {
    if (!term || term.length < 3) {
      throw new Error("Term must be at least 3 letters long");
    }
    return DependencyScan.Instance.search(term);
  }
}
