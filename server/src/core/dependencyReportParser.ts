import { INode, LibraryInfoEnum } from "./interfaces";

export class DependencyReportParser {
  private readonly libraryIdentifier = /[+\\]---/;

  private readonly ROOT_NODE_NAME = "ROOT";

  private readonly configurationRegex = /^([a-z]+)\s-\s.*\.(\s\(n\))?$/i;

  public parse(content: string): INode[] {
    const lines = this.getTreeLines(content);
    let tree = this.getTree(lines);
    tree = this.removeProjectNodes(tree);
    //core.writeTextFile("testingOutput.txt", JSON.stringify(tree, null, 2));
    return tree;
  }

  testingPrint(nodes: INode[]): string {
    let str = "";
    for (const node of nodes) {
      str += `${"|    ".repeat(node.level - 1)}${node.hypens} ${node.libraryInfo.name}:${node.libraryInfo.versionPart}\r\n`;
      if (node.childNodes.length > 0) {
        str += this.testingPrint(node.childNodes);
      }
    }
    return str;
  }

  private getTree(lines: string[]): INode[] {
    const root: INode = {
      level: 0,
      libraryInfo: { name: this.ROOT_NODE_NAME, versionPart: "", info: LibraryInfoEnum.None, version: "" },
      childNodes: [],
      hypens: "",
      configuration: "",
    };
    this.createSubNode(root, root, lines, "");
    return root.childNodes;
  }

  private createSubNode(parentNode: INode, prevNode: INode, lines: string[], configuration: string): INode | undefined {
    let line = lines.shift();
    while (line !== undefined) {
      const hypenSepParts = line.split(this.libraryIdentifier);
      if (hypenSepParts.length > 1) {
        const beforeIdentifier = line.substring(0, hypenSepParts[0].length);
        if (beforeIdentifier.length % 5 !== 0) {
          throw new Error(`Line has wrong indenting: ${line}`);
        }
        const level = Math.trunc(beforeIdentifier.length / 5) + 1;
        const match = line
          .substring(hypenSepParts[0].length + 4)
          .trim()
          .match(/^(.*):([^:]+)$/);
        let node: INode = {
          level,
          hypens: line.substring(hypenSepParts[0].length, hypenSepParts[0].length + 4),
          libraryInfo: {
            name: match?.[1] ?? line,
            versionPart: match?.[2] ?? "",
            version: this.getVersion(match?.[2] ?? ""),
            info: this.getVersionInfo(match?.[2] ?? ""),
          },
          configuration,
          childNodes: [],
        };
        if (!node.configuration) {
          console.log(node);
          console.error("Configuration is empty. Impossible!");
        }

        if (prevNode.level === level) {
          parentNode.childNodes.push(node);
        } else if (level > prevNode.level) {
          prevNode.childNodes.push(node);
          const nextNode = this.createSubNode(prevNode, node, lines, configuration);
          if (nextNode?.level === parentNode.level + 1) {
            parentNode.childNodes.push(nextNode);
            node = nextNode;
          } else {
            return nextNode;
          }
        } else {
          return node;
        }
        prevNode = node;
      } else if (line.match(this.configurationRegex)) {
        const match = line.match(this.configurationRegex);
        configuration = match[1];
      }
      line = lines.shift();
    }
    return undefined;
  }

  /**
   * Returns only lines that contains dependencies.
   * @param content
   */
  private getTreeLines(content: string): string[] {
    return content.split(/\r?\n/).filter((line) => (line.includes("---") || line.match(this.configurationRegex)) && !line.includes("-----------"));
  }

  private removeProjectNodes(nodes: INode[]) {
    const newNodes: INode[] = [];
    for (const node of nodes) {
      if (!this.isProjectNode(node)) {
        newNodes.push(node);
        if (node.childNodes.length > 0) {
          node.childNodes = this.removeProjectNodes(node.childNodes);
        }
      }
    }
    return newNodes;
  }

  private isProjectNode(node: INode): boolean {
    // if (node.libraryInfo.name.includes("project") || node.libraryInfo.versionPart.includes("project")) {
    //   console.log(node.libraryInfo);
    // }
    return node.libraryInfo.name.startsWith("project ") || node.libraryInfo.name.includes("-> project ");
  }

  private getVersion(versionPart: string) {
    versionPart = versionPart.replace(/\(.*\)/, "").trim();
    versionPart = versionPart.replace(/^.*\->/, "").trim();
    return versionPart;
  }

  private getVersionInfo(versionPart: string): LibraryInfoEnum {
    const match = versionPart.trim().match(/\((.*)\)$/);
    if (match) {
      return match[1] as LibraryInfoEnum;
    }
    return LibraryInfoEnum.None;
  }
}
