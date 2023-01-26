import { INode, IOccurrence } from "./interfaces";

export class DependencyCollector {
  public collect(nodes: INode[], library: string): IOccurrence[] {
    const occurrences: IOccurrence[] = [];
    this.collectInternal(nodes, library, occurrences);
    return occurrences;
  }

  public collectLibraries(nodes: INode[], allUsedLibraries: Set<string>, library: string) {
    for (const node of nodes) {
      if (node.library.includes(library)) {
        allUsedLibraries.add(node.library);
      }
      if (node.childNodes.length > 0) {
        this.collectLibraries(node.childNodes, allUsedLibraries, library);
      }
    }
  }

  private collectInternal(nodes: INode[], library: string, occurrences: IOccurrence[], parents: INode[] = []) {
    for (const node of nodes) {
      const pathToRoot = [node, ...parents];
      if (node.library == library) {
        occurrences.push({
          library: node.library + ":" + node.version,
          usedBy: pathToRoot.map((n) => n.library + ":" + n.version),
        });
      }
      if (node.childNodes.length) {
        this.collectInternal(node.childNodes, library, occurrences, pathToRoot);
      }
    }
  }
}
