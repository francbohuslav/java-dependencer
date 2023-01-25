import { NestFactory } from '@nestjs/core';
import * as commandLineArgs from 'command-line-args';
import { exit } from 'process';
import { AppModule } from './app.module';
import { DependencyScan } from './core/dependencyScan';
import { ICommandOptions } from './core/interfaces';

async function bootstrap() {
  // See ICommandOptions for help
  const optionDefinitions: any[] = [
    { name: 'appFolder', alias: 'a', type: String, multiple: true },
  ];
  const options = commandLineArgs(optionDefinitions) as ICommandOptions;
  //TODO: BF: zrusit
  options.appFolder = [];
  if (!options.appFolder || options.appFolder.length === 0) {
    console.log(
      `Syntax: npx java-dependencer --appFolder {multiple folders to java source code} --dependency {some library name}
  
      -a, --appFolder {appDir1} --appFolder {appDir2}     
            Scans given source codes. It search for build.gradle of subproject folders. 
            Expect that Gradle Wrapper (gradlew) exists in app directory.
            Executes ..\\gradlew dependencies from subproject folder.
  
      -d, --dependency {some string} 
            This string is searched in library names
  
      -e, --useExistingOutput
            Use dependency files in output folder if already exist. Only new report.json will be created. 
  
      Output report files are saved into {current folder}/_javaDependencerOutput.
  `,
    );
    exit(1);
  } else {
    DependencyScan.Instance = new DependencyScan(options, console);
    await DependencyScan.Instance.scan();
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
  }
}
bootstrap();
