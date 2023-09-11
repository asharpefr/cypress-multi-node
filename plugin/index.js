'use strict'

const skipCommand = (cmd) => {
    cmd.attributes.skip = true
    cmd.state = 'skipped'
}

function skipRestOfTheChain(cmd) {
    while (
        cmd &&
        cmd.attributes.name !== 'nodeCompleted'
        ) {
        skipCommand(cmd)
        cmd = cmd.attributes.next
    }
}

function findMyNodeId(elseCommandAttributes) {
    if (!elseCommandAttributes) {
        return
    }
    if (elseCommandAttributes.name === 'node') {
        return elseCommandAttributes.args[0]
    }
    // if (
    //     !elseCommandAttributes.skip &&
    //     !Cypress._.isNil(elseCommandAttributes.subject)
    // ) {
    //     return elseCommandAttributes.subject
    // }
    if (elseCommandAttributes.prev) {
        return findMyNodeId(elseCommandAttributes.prev.attributes)
    }
}

const nodePrepare = function(subject, id, runId) {
    cy.wrap(id, { log: false }).as('nodeOrchastrationId');
    cy.wrap(runId, { log: false }).as('nodeOrchastrationRunId');
    cy.request({url: `http://localhost:3001/prepare/${runId}/${id}`,
        method: 'PUT', log: false}).then(
        (response) => {

            expect(response.body.state).not.to.equal('already-prepared')

        }
    )
}
Cypress.Commands.add('nodePrepare', { prevSubject: 'optional' }, nodePrepare);


const nodeEnd = function(subject, id, runId) {

    cy.request({url: `http://localhost:3001/end/${this.nodeOrchastrationRunId}/${this.nodeOrchastrationId}`,
        method: 'PUT', log: false}).then(
        (response) => {
        }

    )
}
Cypress.Commands.add('nodeEnd', { prevSubject: 'optional' }, nodeEnd);



const node = function(subject, id) {

    const cmd = cy.state('current')

    if(id !== this.nodeOrchastrationId){
        skipRestOfTheChain(cmd);
    }else{
        cy.log('Node:' + id);
    }
}
Cypress.Commands.add('node', { prevSubject: 'optional' }, node);

const nodeCompleted = function(subject, task) {

    const cmd = cy.state('current')
    const id = findMyNodeId(cmd.attributes);
    if(id === this.nodeOrchastrationId){
        cy.log(id +' done:' + task );
        cy.request({url: `http://localhost:3001/complete/${this.nodeOrchastrationRunId}/${id}/${task}`,
        method: 'PUT', log: false}).then(
            (response) => {
                // response.body is automatically serialized into JSON
                expect(response.body)

            }
        )
    }

}
Cypress.Commands.add('nodeCompleted', { prevSubject: 'optional' }, nodeCompleted);


const nodeWaitFor = function(subject, tasks){

    let minTimeout = 9999999;
    for(const t of tasks){
        if(t.timeout < minTimeout){
            minTimeout = t.timeout;
        }
    }
    const endTime = Date.now() + minTimeout

    const check = function(result) {

        if (result.state === 0) {
            return result
        }else if (result.state === 2) {
            expect(1).to.be.equal(5)
        }
        if (Date.now() >= endTime) {
            throw new Error('One timed out');
        }
        cy.wait(100, { log: false }).then(function() {
            return resolveValue(this.nodeOrchastrationRunId)
        })
    }

    const resolveValue = function(runId){
        cy.request({url: `http://localhost:3001/check/${runId}`,
            method: 'POST', log: false, body: tasks}).then(
            (response) => {
                // response.body is automatically serialized into JSON
                return check(response.body)
            }
        )
    }
    return resolveValue(this.nodeOrchastrationRunId)
}
Cypress.Commands.add('nodeWaitFor', { prevSubject: 'optional' }, nodeWaitFor);

