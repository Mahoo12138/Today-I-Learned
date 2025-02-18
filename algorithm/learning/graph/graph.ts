export class Graph<T> {
  // 使用 Map 存储节点及其邻居列表
  protected adjacencyList: Map<T, T[]>;

  constructor() {
    this.adjacencyList = new Map();
  }

  // 添加节点
  addNode(node: T): void {
    if (!this.adjacencyList.has(node)) {
      this.adjacencyList.set(node, []);
    }
  }

  // 添加边（无向图）
  addEdge(node1: T, node2: T): void {
    if (!this.adjacencyList.has(node1)) this.addNode(node1);
    if (!this.adjacencyList.has(node2)) this.addNode(node2);

    this.adjacencyList.get(node1)?.push(node2);
    this.adjacencyList.get(node2)?.push(node1); // 有向图则删除此行
  }

  // 获取所有节点
  getNodes(): T[] {
    return Array.from(this.adjacencyList.keys());
  }

  // 获取邻居
  getNeighbors(node: T): T[] {
    return this.adjacencyList.get(node) || [];
  }

  // DFS 递归实现
  dfs(start: T): T[] {
    const visited = new Set<T>();
    const result: T[] = [];

    const dfsVisit = (node: T) => {
      if (visited.has(node)) return;
      visited.add(node);
      result.push(node);
      const neighbors = this.getNeighbors(node);
      for (const neighbor of neighbors) {
        dfsVisit(neighbor);
      }
    };

    dfsVisit(start);
    return result;
  }

  // DFS 栈实现
  dfsStack(start: T): T[] {
    const stack: T[] = [start];
    const visited = new Set<T>();
    const result: T[] = [];

    while (stack.length > 0) {
      const node = stack.pop()!; // 弹出栈顶
      if (!visited.has(node)) {
        visited.add(node);
        result.push(node);
        // 将邻居逆序入栈，保证顺序与递归一致
        const neighbors = this.getNeighbors(node).reverse();
        for (const neighbor of neighbors) {
          stack.push(neighbor);
        }
      }
    }
    return result;
  }

  // BFS 队列实现
  bfs(start: T): T[] {
    const queue: T[] = [start];
    const visited = new Set<T>();
    const result: T[] = [];

    visited.add(start);

    while (queue.length > 0) {
      const node = queue.shift()!; // 从队列头部取出
      result.push(node);
      const neighbors = this.getNeighbors(node);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return result;
  }
}

// 测试
function testGraph() {
  const graph = new Graph<string>();

  graph.addEdge("A", "B");
  graph.addEdge("A", "C");
  graph.addEdge("B", "D");
  graph.addEdge("C", "D");

  // DFS 递归
  console.log(graph.dfs("A")); // 输出: ['A', 'B', 'D', 'C']

  // DFS 栈
  console.log(graph.dfsStack("A")); // 输出: ['A', 'B', 'D', 'C']

  // BFS
  console.log(graph.bfs("A")); // 输出: ['A', 'B', 'C', 'D']
}

// testGraph();
