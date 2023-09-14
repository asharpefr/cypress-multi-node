/// <reference types="Cypress" />

type NodeTask = {node: string, taskId: string, timeout: number}

declare namespace Cypress {
  interface Chainable<Subject = any> {
    nodePrepare(id: string, runId: string): Chainable<void>;
    nodeChainStart(id?: string): Chainable<void>;
    nodeChainEnd(taskId: string): Chainable<void>;
    nodeWaitFor(tasks: NodeTask[]): Chainable<void>;
    nodeCompleted(id: string): Chainable<void>;
  }
}
