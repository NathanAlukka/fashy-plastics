import{Component}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{MatButtonModule}from'@angular/material/button';
import{MatFormFieldModule}from'@angular/material/form-field';
import{MatIconModule}from'@angular/material/icon';
import{MatInputModule}from'@angular/material/input';
import{ProductionSection}from'../../models';
import{AppStateService}from'../../services/app-state.service';
import{AuthService}from'../../services/auth.service';
import{DailyRecordService}from'../../services/daily-record.service';
import{MockDataService}from'../../services/mock-data.service';
import{OutputRecordService}from'../../services/output-record.service';
import{SearchableSelectComponent}from'../../shared/searchable-select/searchable-select.component';
import{WorkerDirectoryService}from'../../services/worker-directory.service';

@Component({standalone:true,imports:[FormsModule,MatButtonModule,MatFormFieldModule,MatIconModule,MatInputModule,SearchableSelectComponent],templateUrl:'./daily-production.component.html',styleUrl:'./daily-production.component.scss'})
export class DailyProductionComponent{
date:string;sections:ProductionSection[]=[];message='';activeView:'schedule'|'result'='schedule';readonly workerAddedIds=new Set<string>();readonly sessionOptions=['Day','Night'];
constructor(public data:MockDataService,public state:AppStateService,public auth:AuthService,public daily:DailyRecordService,public cloud:OutputRecordService,public workerDirectory:WorkerDirectoryService){this.date=state.selectedDate();this.activeView=this.isHead?'schedule':'result';void this.workerDirectory.load();void this.load()}
get isHead():boolean{return this.state.mode()==='head'}
get scheduleExists():boolean{return this.auth.enabled?['published','completed'].includes(this.daily.record()?.status??''):!!this.state.schedule()?.createdByHead}
get outputParts():string[]{return this.data.parts}
get workerOptions():string[]{return this.workerDirectory.names().length?this.workerDirectory.names():this.data.workers}
async load():Promise<void>{
  this.workerAddedIds.clear();
  if(this.auth.enabled){
    const saved=await this.cloud.load(this.date);this.sections=saved.map(section=>this.copy(section));const uid=this.auth.profile()?.uid;
    for(const section of saved)if(!this.isHead&&section.source==='worker'&&section.createdBy===uid)this.workerAddedIds.add(section.id);
    if(this.isHead&&!this.sections.length)this.sections=[this.blank()];return;
  }
  this.sections=(this.state.schedule()?.output??[]).map(section=>this.copy(section));if(this.isHead&&!this.sections.length)this.sections=[this.blank()];
}
dateChanged():void{this.state.setDate(this.date);void this.load()}
setView(view:'schedule'|'result'):void{this.activeView=view}
add():void{const section=this.blank();if(!this.isHead)this.workerAddedIds.add(section.id);this.sections=[...this.sections,section]}
remove(id:string):void{const existedInCloud=this.cloud.cycles().some(section=>section.id===id);this.sections=this.sections.filter(section=>section.id!==id);if(this.auth.enabled&&!this.isHead&&this.workerAddedIds.has(id)&&existedInCloud)void this.cloud.deleteWorkerCycle(this.date,id);this.workerAddedIds.delete(id);if(!this.sections.length&&this.isHead)this.sections=[this.blank()]}
assignmentLocked(section:ProductionSection):boolean{return(this.isHead&&this.activeView==='result')||(!this.isHead&&!this.workerAddedIds.has(section.id))}
galaHasData(section:ProductionSection,index:number):boolean{return[section.galaProducts[index],section.workers[index],section.rawGrades[index],section.rawTypes[index],section.sessions[index],section.sessionNumbers[index],section.counted[index],section.actual[index],section.requiredQuantities[index],section.plannedLots[index]].some(value=>value!==null&&value!=='')}
galaValid(section:ProductionSection,index:number):boolean{if(!this.galaHasData(section,index))return true;return!!section.galaProducts[index]&&!!section.workers[index]&&!!section.rawGrades[index]&&!!section.rawTypes[index]&&!!section.sessions[index]&&(section.sessionNumbers[index]??0)>0}
valid():boolean{return!!this.date&&this.sections.length>0&&this.sections.every(section=>section.galaProducts.every((_,index)=>this.galaValid(section,index)))}
async save():Promise<void>{
  if(!this.valid())return;
  if(this.auth.enabled){
    try{
      if(this.isHead){if(this.daily.record()?.status!=='draft'){this.show('Create or select a Draft day before saving the schedule.');return}await this.cloud.saveHeadSchedule(this.date,this.sections)}
      else{if(this.daily.record()?.status!=='published'){this.show('This schedule is not open for worker submissions.');return}await this.cloud.submitWorkerResults(this.date,this.sections,this.workerAddedIds)}
      this.sections=this.cloud.cycles().map(section=>this.copy(section));this.cacheLocally();this.show(this.cloud.message());return;
    }catch{this.show(this.cloud.message());return}
  }
  this.cacheLocally();this.show(this.isHead?'Schedule saved successfully.':'Work saved successfully.');
}
private cacheLocally():void{const schedule=this.state.schedule()??this.state.empty();schedule.date=this.date;schedule.output=this.sections.map(section=>this.copy(section));this.state.save(schedule,this.state.mode())}
private show(message:string):void{this.message=message;setTimeout(()=>this.message='',3500)}
private copy(section:ProductionSection):ProductionSection{return{...section,galaProducts:[...section.galaProducts],workers:[...(section.workers??Array(6).fill(''))],rawGrades:[...(section.rawGrades??Array(6).fill(''))],rawTypes:[...(section.rawTypes??Array(6).fill(''))],sessions:[...(section.sessions??Array(6).fill(''))],sessionNumbers:[...(section.sessionNumbers??Array(6).fill(null))],counted:[...section.counted],actual:[...section.actual],requiredQuantities:[...(section.requiredQuantities??Array(6).fill(null))],plannedLots:[...(section.plannedLots??Array(6).fill(null))]}}
private blank():ProductionSection{return{id:crypto.randomUUID(),product:'',galaProducts:Array(6).fill(''),workers:Array(6).fill(''),rawGrades:Array(6).fill(''),rawTypes:Array(6).fill(''),sessions:Array(6).fill(''),sessionNumbers:Array(6).fill(null),counted:Array(6).fill(null),actual:Array(6).fill(null),requiredQuantities:Array(6).fill(null),plannedLots:Array(6).fill(null)}}
}
