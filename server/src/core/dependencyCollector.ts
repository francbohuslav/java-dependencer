import { ICollisonCollector, INode, IOccurrence } from "./interfaces";

export class DependencyCollector {
  public collect(nodes: INode[], library: string): IOccurrence[] {
    const occurrences: IOccurrence[] = [];
    this.collectInternal(nodes, library, occurrences);
    return occurrences;
  }

  public searchForLibraries(nodes: INode[], foundLibraries: Set<string>, library: string) {
    for (const node of nodes) {
      if (node.library.includes(library)) {
        foundLibraries.add(node.library);
      }
      if (node.childNodes.length > 0) {
        this.searchForLibraries(node.childNodes, foundLibraries, library);
      }
    }
  }

  public getAllLibraries(nodes: INode[], allUsedLibraries: ICollisonCollector) {
    for (const node of nodes) {
      if (!allUsedLibraries[node.library]) {
        allUsedLibraries[node.library] = new Set<string>();
      }
      allUsedLibraries[node.library].add(this.getVersion(node.versionPart));

      if (node.childNodes.length > 0) {
        this.getAllLibraries(node.childNodes, allUsedLibraries);
      }
    }
  }

  private collectInternal(nodes: INode[], library: string, occurrences: IOccurrence[], parents: INode[] = []) {
    for (const node of nodes) {
      const pathToRoot = [node, ...parents];
      if (node.library == library) {
        occurrences.push({
          configuration: node.configuration,
          library: node.library,
          versionPart: node.versionPart,
          version: this.getVersion(node.versionPart),
          usedBy: pathToRoot.map((n) => n.library + ":" + n.versionPart),
        });
      }
      if (node.childNodes.length) {
        this.collectInternal(node.childNodes, library, occurrences, pathToRoot);
      }
    }
  }

  private getVersion(versionPart: string) {
    versionPart = versionPart.replace(/\(.*\)/, "").trim();
    versionPart = versionPart.replace(/^.*\->/, "").trim();
    return versionPart;
  }
}
