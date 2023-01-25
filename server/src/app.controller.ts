import { Controller, Get, Query } from '@nestjs/common';
import { DependencyScan } from './core/dependencyScan';
import { IReport } from './core/interfaces';

@Controller()
export class AppController {
  @Get()
  getReport(@Query() term: string): IReport {
    return DependencyScan.Instance.search(term);
  }
}
