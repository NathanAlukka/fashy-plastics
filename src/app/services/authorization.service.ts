import{Injectable}from'@angular/core';
import{GalaOutputCycle,WipRow}from'../models';
import{AppStateService}from'./app-state.service';
import{AuthService}from'./auth.service';
@Injectable({providedIn:'root'})
export class AuthorizationService{
  constructor(private auth:AuthService,private state:AppStateService){}
  get role(){const role=this.auth.profile()?.role;return role==='head'&&this.state.mode()==='controller'?'controller':role}
  get uid():string{return this.auth.profile()?.uid??''}
  get isHead():boolean{return this.role==='head'}
  get isController():boolean{return this.role==='controller'}
  get isWorker():boolean{return this.role==='worker'}
  get canEditAnyResult():boolean{return this.isHead||this.isController}
  canEditWorkResult(row:WipRow):boolean{return this.canEditAnyResult||this.isWorker&&!!row.workerUid&&row.workerUid===this.uid}
  canEditOutputResult(cycle:GalaOutputCycle):boolean{return this.canEditAnyResult||this.isWorker&&cycle.machines.some(machine=>(machine.workerUids??[]).includes(this.uid))}
  canEditUnownedResult():boolean{return this.canEditAnyResult}
}
