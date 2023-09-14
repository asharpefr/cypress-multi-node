it('Simple', () => {

  //Task visit must not be used with node chaining
  cy.visit('http://localhost:3000/');
  cy.log('Start');
  cy.log(Cypress.env('node'));
  cy.nodePrepare(Cypress.env('node'), Cypress.env('run'));
  cy.nodeChainStart('node-2').get("[key-cy=content]").nodeChainEnd('loaded');
  cy.nodeChainStart('node-1').get("[key-cy=content]").nodeChainEnd('loaded');
  cy.nodeWaitFor([{
    node: 'node-1',
    taskId: 'loaded',
    timeout: 30000
  },
    {
      node: 'node-2',
      taskId: 'loaded',
      timeout: 30000
    }])
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
  cy.nodeCompleted(Cypress.env('node'));
})
