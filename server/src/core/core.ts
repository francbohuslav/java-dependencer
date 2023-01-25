import * as fs from 'fs';

export class Core {
  /**
   *
   * @param {string} file
   */
  public readTextFile(file: string) {
    return fs.readFileSync(file, { encoding: 'utf-8' }).toString();
  }

  public writeTextFile(filePath: string, data: string) {
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' });
  }
}

export default new Core();
