#! /usr/bin/env node
/* istanbul ignore file */
import commandLineArgs, { OptionDefinition } from "command-line-args";
import { exit } from "process";
import { DependencyScan } from "./dependencyScan";
import { ICommandOptions } from "./interfaces";

// See ICommandOptions for help
const optionDefinitions: OptionDefinition[] = [
  { name: "appFolder", alias: "a", type: String, multiple: true },
  { name: "dependency", alias: "d", type: String },
  { name: "useExistingOutput", alias: "e", type: Boolean },
];
const options = commandLineArgs(optionDefinitions) as ICommandOptions;
if (!options.appFolder || options.appFolder.length === 0 || !options.dependency) {
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
`
  );
  exit(1);
} else {
  new DependencyScan(options, console).run();
}
