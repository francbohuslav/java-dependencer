import { INode, IOccurrence } from './interfaces';

export class DependencyCollector {
  public collect(nodes: INode[], desiredDependency: string): IOccurrence[] {
    const occurrences: IOccurrence[] = [];
    this.collectInternal(nodes, desiredDependency, occurrences);
    return occurrences;
  }

  private collectInternal(
    nodes: INode[],
    desiredDependency: string,
    occurrences: IOccurrence[],
    parents: INode[] = [],
  ) {
    for (const node of nodes) {
      const pathToRoot = [node, ...parents];
      if (node.library.includes(desiredDependency)) {
        occurrences.push({
          library: node.library + ':' + node.version,
          usedBy: pathToRoot.map((n) => n.library + ':' + n.version),
        });
      }
      if (node.childNodes.length) {
        this.collectInternal(
          node.childNodes,
          desiredDependency,
          occurrences,
          pathToRoot,
        );
      }
    }
  }
}
