#! /usr/bin/env node
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DependencyScan } from "./core/dependencyScan";

async function bootstrap() {
  DependencyScan.Instance = new DependencyScan(console, process.cwd(), process.argv[2]);
  // DependencyScan.Instance = new DependencyScan(console, "c:\\Gateway\\v6_X\\uu_energygateway_messageregistryg01", process.argv[2]);
  await DependencyScan.Instance.scan(false);
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  console.log("\nOpen http://localhost:3000 in your browser\n");
  await app.listen(3000);
}
bootstrap();
