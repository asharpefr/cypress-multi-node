import {Body, Controller, Get, Param, Post, Put} from "@nestjs/common";

type NodeTask = {node: string, taskId: string, timestamp: number};
//Same as the plugin/index.d.ts
type NodeTaskCheck = NodeTask & {timeout: number};

@Controller()
export class AppController {

  private tasks: Map<string, NodeTask[]> = new Map<string, NodeTask[]>();

  constructor() {}

  @Post("check/:runId")
  check(
    @Param("runId") runId: string,
    @Body() tasks: NodeTaskCheck[],
  ): { state: string } {
    console.log('check-run', runId );

    const exectasks = this.tasks.get(runId);
    let oneIsTimeout = false;
    let allCompleted = true;
    if(exectasks){
      for(const nt of tasks){
        const f = exectasks.find(n => n.node === nt.node && n.taskId === nt.taskId)
        if(f){
          if(f.timestamp + nt.timeout < Date.now()){
            oneIsTimeout = true;
          }
        }else {
          allCompleted = false;
        }
      }

      if(oneIsTimeout){
        return {state : "one-timed-out"};
      }
      if(!allCompleted){
        return {state : 'not-all-completed'};
      }

      return {state : "all-completed"};
    }
    return {state : "no-run"};
  }

  @Put("prepare/:runId/:nodeId")
  async prepare(
    @Param("runId") runId: string,
    @Param("nodeId") nodeId: string,
  ) {
    console.log(`Spec prepare: ${runId} ${nodeId}`);
    if(!this.tasks.has(runId)){
      this.tasks.set(runId, []);
    };

    const t = this.tasks.get(runId);
    const p = t.find(n => n.node === nodeId && n.taskId === 'prepared');
    if(p){
      return {state : 'already-prepared'};
    }else{
      t.push({node: nodeId, taskId: 'prepared', timestamp: Date.now()})
      return {state : 'first-run'};
    }
  }

  @Put("end/:runId/:nodeId")
  async end(
    @Param("runId") runId: string,
    @Param("nodeId") nodeId: string,
  ) {
    console.log(`Spec end: ${runId} ${nodeId}`);
    if(!this.tasks.has(runId)){
      //TODO FAIL
    };

    const t = this.tasks.get(runId);
    t.push({node: nodeId, taskId: 'end', timestamp: Date.now()})

  }

  @Put("complete/:runId/:nodeId/:stepId")
  async completed(
    @Param("runId") runId: string,
    @Param("nodeId") nodeId: string,
    @Param("stepId") stepId: string,
  ) {
    if(!this.tasks.has(runId)){
      this.tasks.set(runId, []);
    };
    this.tasks.get(runId).push({node: nodeId, taskId: stepId, timestamp: Date.now()});
    console.log(`Spec completed: ${runId} ${nodeId} ${stepId}`);
  }
}
