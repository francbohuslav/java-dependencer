#! /usr/bin/env node
import { NestFactory } from "@nestjs/core";
//TODO: BF: az to bude jiste, tak odstranit z package.json command line veci
import { AppModule } from "./app.module";
import { DependencyScan } from "./core/dependencyScan";

async function bootstrap() {
  DependencyScan.Instance = new DependencyScan(console, process.cwd());
  //DependencyScan.Instance = new DependencyScan(console, "c:\\Gateway\\v4_X\\");
  await DependencyScan.Instance.scan(false);
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  console.log("\nOpen http://localhost:3000 in your browser\n");
  await app.listen(3000);
}
bootstrap();
