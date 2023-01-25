import { IConsole, INode } from "./interfaces";

export class DependencyReportParser {
  private readonly libraryIdentifier = /[+\\]---/;

  constructor(private console: IConsole) {}

  public parse(content: string): INode[] {
    const lines = this.getTreeLines(content);
    const tree = this.getTree(lines);
    //core.writeTextFile("testingOutput.txt", this.testingPrint(tree));
    return tree;
  }

  /* istanbul ignore next */
  testingPrint(nodes: INode[]): string {
    let str: string = "";
    for (const node of nodes) {
      str += `${"|    ".repeat(node.level - 1)}${node.hypens} ${node.library}:${node.version}\r\n`;
      if (node.childNodes.length > 0) {
        str += this.testingPrint(node.childNodes);
      }
    }
    return str;
  }

  private getTree(lines: string[]): INode[] {
    const root: INode = {
      level: 0,
      library: "ROOT",
      childNodes: [],
      version: "",
      hypens: "",
    };
    this.createSubNode(root, root, lines);
    return root.childNodes;
  }

  private createSubNode(parentNode: INode, prevNode: INode, lines: string[]): INode | undefined {
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
          library: match ? match[1] : line,
          version: match ? match[2] : "",
          childNodes: [],
        };

        if (prevNode.level === level) {
          parentNode.childNodes.push(node);
        } else if (level > prevNode.level) {
          prevNode.childNodes.push(node);
          const nextNode = this.createSubNode(prevNode, node, lines);
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
    return content.split(/\r?\n/).filter((line) => line.includes("---"));
  }
}
