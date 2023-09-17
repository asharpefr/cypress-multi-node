'use strict'

const skipCommand = (cmd) => {
    cmd.attributes.skip = true
    cmd.state = 'skipped'
}

function skipRestOfTheChain(cmd) {
    while (
        cmd &&
        cmd.attributes.name !== 'nodeChainEnd'
        ) {
        skipCommand(cmd)
        cmd = cmd.attributes.next
    }
}

function getChainNodeId(cmdAttributes) {
    if (!cmdAttributes) {
        return
    }
    if (cmdAttributes.name === 'nodeChainStart') {
        return cmdAttributes.args[0]
    }
    if (cmdAttributes.prev) {
        return getChainNodeId(cmdAttributes.prev.attributes)
    }
}

const nodePrepare = function(subject, id, runId) {
    cy.wrap(id, { log: false }).as('nodeOrchastrationId');
    cy.wrap(runId, { log: false }).as('nodeOrchastrationRunId');

    cy.request({url: `${Cypress.env('ORCHESTRATOR_URL')}/prepare/${runId}/${id}`,
        method: 'PUT', log: true}).then(
        (response) => {
            // expect(response.body.state).not.to.equal('already-prepared')
        }
    )

    // cy.wrap(null).then(() => {
    //     // return a promise to cy.then() that
    //     // is awaited until it resolves
    //     return new Cypress.Promise((resolve, reject) => {
    //         console.log('url');
    //         fetch(`${Cypress.env('ORCHESTRATOR_URL')}/prepare/${runId}/${id}`, {
    //             method: "GET", // or 'PUT'
    //         }).then(()=> resolve())
    //             .catch(() => reject());
    //     }).then(() => console.log('prep'))
    // })
}
Cypress.Commands.add('nodePrepare', { prevSubject: 'optional' }, nodePrepare);


const nodeCompleted = function(subject, id, runId) {
    cy.request({url: `${Cypress.env('ORCHESTRATOR_URL')}/end/${this.nodeOrchastrationRunId}/${this.nodeOrchastrationId}`,
        method: 'PUT', log: false}).then(
        (response) => {
        }

    )
}
Cypress.Commands.add('nodeCompleted', { prevSubject: 'optional' }, nodeCompleted);



const nodeChainStart = function(subject, id) {

    const cmd = cy.state('current')
    if(!id) id = this.this.nodeOrchastrationId;
    if(id !== this.nodeOrchastrationId){
        skipRestOfTheChain(cmd);
    }else{
        cy.log('Node:' + id);
    }
}
Cypress.Commands.add('nodeChainStart', { prevSubject: 'optional' }, nodeChainStart);

const nodeChainEnd = function(subject, task) {
    const cmd = cy.state('current')
    const id = getChainNodeId(cmd.attributes);
    if(id === this.nodeOrchastrationId){
        cy.log(id +' done:' + task );
        cy.request({url: `${Cypress.env('ORCHESTRATOR_URL')}/complete/${this.nodeOrchastrationRunId}/${id}/${task}`,
        method: 'PUT', log: false}).then(
            (response) => {
                // response.body is automatically serialized into JSON
                expect(response.body)
            }
        )
    }
}
Cypress.Commands.add('nodeChainEnd', { prevSubject: true }, nodeChainEnd);


const nodeWaitFor = function(subject, tasks){

    let minTimeout = 9999999;
    for(const t of tasks){
        if(t.timeout < minTimeout){
            minTimeout = t.timeout;
        }
    }
    const endTime = Date.now() + minTimeout

    const check = function(result) {

        if (result.state === 'all-completed') {
            return result
        }else if (result.state === "one-timed-out") {
            throw new Error('One timed out');
        }else if (result.state === "not-all-completed") {
            //WAITING
        }
        if (Date.now() >= endTime) {
            throw new Error('Time out, didn\'t receive status from orchestrator');
        }
        cy.wait(100, { log: false }).then(function() {
            return resolveValue(this.nodeOrchastrationRunId)
        })
    }

    const resolveValue = function(runId){
        cy.request({url: `${Cypress.env('ORCHESTRATOR_URL')}/check/${runId}`,
            method: 'POST', log: false, body: tasks}).then(
            (response) => {
                return check(response.body)
            }
        )
    }
    return resolveValue(this.nodeOrchastrationRunId)
}
Cypress.Commands.add('nodeWaitFor', { prevSubject: 'optional' }, nodeWaitFor);

