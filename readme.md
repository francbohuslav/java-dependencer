# Java dependencer

Java project dependency analyzator, uses gradle.

Home page: <https://github.com/francbohuslav/java-dependencer>  
Skype: [cis_franc](skype:cis_franc), E-mail: [bohuslav.franc@unicornuniverse.eu](bohuslav.franc@unicornuniverse.eu)

---

## Preparation

[Node.js](https://nodejs.org/) must be installed.

---

## Usage

1. Execute `npx java-dependencer {options}` somewhere near your Java project folder.
2. Read `_javaDependencerOutput/report.json`.

### Syntax

`npx java-dependencer -a {java project source code} -a {another java projectsource code} -d {some library name} -e`

    -a, --appFolder {appDir1} --appFolder {appDir2}
          Scans given source codes. It searches for build.gradle of subproject folders.
          Expect that Gradle Wrapper (gradlew) exists in app directory.
          Executes ../gradlew dependencies from subproject folder.

    -d, --dependency {some string}
          This string is searched in library names.

    -e, --useExistingOutput
          Use dependency files in output folder if already exist. Only new report.json will be created.

Output report files are saved into `{current folder}/_javaDependencerOutput`.

---

## Screenshot

![screenshot](https://raw.githubusercontent.com/francbohuslav/java-dependencer/master/screenshot.png)
