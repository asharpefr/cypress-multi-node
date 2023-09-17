it('Simple', () => {

  //Task visit must NOT be used with node chaining
  cy.visit('http://localhost:3000/');

  // Prepare the current node that will be running this spec test
  // Using ENV, so it can be provided by the launcher of the cypress run
  // For this sample, env are set in the package.json
  cy.nodePrepare(Cypress.env('node'), Cypress.env('run'));
  // Will be only executed on 'node-1', the chain is finished with nodeChainEnd that will share with
  // the orchestrator server a key that can be used later on.
  cy.nodeChainStart('node-1').get("[key-cy=content]").nodeChainEnd('loaded');
  // Will be only executed on 'node-2'
  cy.nodeChainStart('node-2').get("[key-cy=content]").nodeChainEnd('loaded');

  // Will wait for 'node-1' & 'node-2', to have each completed the task 'loaded'
  cy.nodeWaitFor([{
    node: 'node-1',
    taskId: 'loaded',
    timeout: 3000
  },
    {
      node: 'node-2',
      taskId: 'loaded',
      timeout: 3000
    }])

  // Another way of writing a chain
  cy.nodeChainStart('node-1')
  cy.log("Node 1 Step");
  cy.nodeCompleted('log-step');

  cy.nodeChainStart('node-2');
  cy.log("Node 2 Step");
  cy.nodeCompleted('log-step');


  cy.nodeWaitFor([{
    node: 'node-1',
    taskId: 'log-step',
    timeout: 30000
  },{
    node: 'node-2',
    taskId: 'log-step',
    timeout: 30000
  }])

  // Telling the orchestrator that the node tasks are completed
  cy.nodeCompleted(Cypress.env('node'));
})
