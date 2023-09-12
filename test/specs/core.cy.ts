it('works', () => {

  cy.log('Start');
  cy.nodePrepare('node-1', 'run1'+Math.random());

  cy.node('node-1').visit('http://localhost:3000/').nodeCompleted('visit');
  cy.node('node-2').visit('http://localhost:3000/').nodeCompleted('visit');
  cy.node('node-3').visit('http://localhost:3000/').nodeCompleted('visit');

  cy.node('node-1')
    cy.log("Node 1 Step");
      cy.nodeCompleted('log-step');
  cy.node('node-2');
  cy.log("Node 2 Step");
  cy.nodeCompleted('log-step');
  cy.nodeWaitFor([{
    node: 'node-3',
    taskId: 'log-step',
    timeout: 3000
  }])
  cy.nodeEnd('node-1');
})
