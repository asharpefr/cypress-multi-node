/// <reference types="Cypress" />

type NodeTask = {node: string, taskId: string, timeout: number}

declare namespace Cypress {
  interface Chainable<Subject = any> {
    nodePrepare(id: string, runId: string): Chainable<void>;
    node(id: string): Chainable<void>;
    nodeCompleted(taskId: string): Chainable<void>;
    nodeWaitFor(tasks: NodeTask[]): Chainable<void>;
    nodeEnd(id: string): Chainable<void>;
  }
}
