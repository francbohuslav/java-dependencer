import * as md5 from "md5";
import { ICollisonCollector, INode, IOccurrence } from "./interfaces";

export class DependencyCollector {
  public collectOccurences(nodes: INode[], library: string): IOccurrence[] {
    let occurrences: IOccurrence[] = [];
    this.collectOccurencesInternal(nodes, library, occurrences);
    occurrences = this.mergeSameOccurences(occurrences);
    return occurrences;
  }

  public searchForLibraries(nodes: INode[], foundLibraries: Set<string>, library: string) {
    for (const node of nodes) {
      if (node.libraryInfo.name.includes(library)) {
        foundLibraries.add(node.libraryInfo.name);
      }
      if (node.childNodes.length > 0) {
        this.searchForLibraries(node.childNodes, foundLibraries, library);
      }
    }
  }

  public getAllLibraries(nodes: INode[], allUsedLibraries: ICollisonCollector) {
    for (const node of nodes) {
      const name = node.libraryInfo.name;
      if (!allUsedLibraries[name]) {
        allUsedLibraries[name] = new Set<string>();
      }
      allUsedLibraries[name].add(node.libraryInfo.version);

      if (node.childNodes.length > 0) {
        this.getAllLibraries(node.childNodes, allUsedLibraries);
      }
    }
  }

  private collectOccurencesInternal(nodes: INode[], library: string, occurrences: IOccurrence[], parents: INode[] = []) {
    for (const node of nodes) {
      const pathToRoot = [node, ...parents];
      if (node.libraryInfo.name === library) {
        occurrences.push({
          configurations: [node.configuration],
          libraryInfo: node.libraryInfo,
          usedBy: pathToRoot.map((n) => n.libraryInfo),
        });
      }
      if (node.childNodes.length) {
        this.collectOccurencesInternal(node.childNodes, library, occurrences, pathToRoot);
      }
    }
  }
  private mergeSameOccurences(occurrences: IOccurrence[]): IOccurrence[] {
    const occurrencesPerHash: { [hash: string]: IOccurrence } = {};
    for (const occ of occurrences) {
      const key = md5(`${occ.libraryInfo.name}|${occ.libraryInfo.versionPart}|${occ.usedBy.join("|")}`);
      if (occurrencesPerHash[key]) {
        if (!occurrencesPerHash[key].configurations.includes(occ.configurations[0])) {
          occurrencesPerHash[key].configurations.push(occ.configurations[0]);
        }
      } else {
        occurrencesPerHash[key] = occ;
      }
    }
    for (const occ of Object.values(occurrencesPerHash)) {
      occ.configurations.sort();
    }
    return Object.values(occurrencesPerHash);
  }
}
