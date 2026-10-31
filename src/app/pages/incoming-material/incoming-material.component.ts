import{Component}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{MatButtonModule}from'@angular/material/button';
import{MatCardModule}from'@angular/material/card';
import{MatFormFieldModule}from'@angular/material/form-field';
import{MatIconModule}from'@angular/material/icon';
import{MatInputModule}from'@angular/material/input';
import{MatTableModule}from'@angular/material/table';
import{IncomingRow}from'../../models';
import{AppStateService}from'../../services/app-state.service';
import{AuthService}from'../../services/auth.service';
import{DailyRecordService}from'../../services/daily-record.service';
import{IncomingRecordService}from'../../services/incoming-record.service';
import{MockDataService}from'../../services/mock-data.service';
import{SearchableSelectComponent}from'../../shared/searchable-select/searchable-select.component';
import{AuthorizationService}from'../../services/authorization.service';

@Component({standalone:true,imports:[FormsModule,MatButtonModule,MatCardModule,MatFormFieldModule,MatIconModule,MatInputModule,MatTableModule,SearchableSelectComponent],templateUrl:'./incoming-material.component.html',styleUrl:'./incoming-material.component.scss'})
export class IncomingMaterialComponent{
draft:IncomingRow=this.blank();rows:IncomingRow[]=[];readonly workerAddedIds=new Set<string>();editingId='';message='';activeView:'schedule'|'result'='schedule';
constructor(public data:MockDataService,public state:AppStateService,public auth:AuthService,public daily:DailyRecordService,public cloud:IncomingRecordService,public access:AuthorizationService){this.activeView=this.isHead?'schedule':'result';void this.load()}
get isHead():boolean{return this.access.isHead}
get isWorker():boolean{return this.access.isWorker}
get canEditResults():boolean{return this.access.canEditUnownedResult()&&this.daily.record()?.status==='published'}
get isDayOff():boolean{return this.daily.record()?.status==='day_off'}
get scheduleExists():boolean{return this.auth.enabled?['published','completed','day_off'].includes(this.daily.record()?.status??''):!!this.state.schedule()?.createdByHead}
get columns():string[]{return this.activeView==='schedule'?['type','material','actions']:['type','material','quantity','actions']}
get draftAssignmentLocked():boolean{const row=this.rows.find(item=>item.id===this.editingId);return!!row&&this.locked(row)}
async load():Promise<void>{this.workerAddedIds.clear();if(this.auth.enabled){const saved=await this.cloud.load(this.state.selectedDate());this.rows=saved.map(row=>({...row}))}else{const saved=this.state.schedule()?.incoming??[];this.rows=saved.map(row=>({...row,id:row.id||crypto.randomUUID()}))}this.editingId='';this.draft=this.blank()}
dateChanged():void{this.state.setDate(this.draft.date);void this.load()}
setView(view:'schedule'|'result'):void{this.activeView=view;this.editingId='';this.draft=this.blank()}
materials():string[]{return this.data.materials}
locked(_row:IncomingRow):boolean{return this.activeView==='schedule'?!this.isHead:!this.canEditResults}
get canDeleteEditing():boolean{return!!this.editingId&&this.isHead&&this.activeView==='schedule'}
validDraft():boolean{const base=!!this.draft.material&&!!this.draft.materialType;return base&&(this.activeView==='schedule'||this.draft.quantity>0&&!!this.draft.unit)}
add():void{if(!this.validDraft()||(!this.isHead&&(!this.canEditResults||!this.editingId)))return;if(this.editingId){this.rows=this.rows.map(row=>row.id===this.editingId?{...this.draft,id:this.editingId,source:row.source}:row);this.cacheLocally();this.show('Incoming record updated.');this.editingId=''}else if(this.isHead&&this.activeView==='schedule'){const id=crypto.randomUUID();this.rows=[...this.rows,{...this.draft,id,source:'head'}]}this.draft=this.blank()}
edit(row:IncomingRow):void{this.draft={...row};this.editingId=row.id;window.scrollTo({top:0,behavior:'smooth'})}
remove(id:string):void{if(!this.isHead||this.activeView!=='schedule')return;this.rows=this.rows.filter(row=>row.id!==id);if(this.editingId===id)this.cancelEdit()}
cancelEdit():void{this.editingId='';this.draft=this.blank()}
deleteEditing():void{if(!this.editingId||!this.canDeleteEditing||!window.confirm('Delete this incoming record?'))return;const id=this.editingId;this.remove(id);this.cacheLocally();this.show('Incoming record deleted.')}
async save():Promise<void>{if(!this.rows.length)return;if(this.auth.enabled){try{if(this.isHead&&this.activeView==='schedule'){if(this.daily.record()?.status!=='draft'){this.show('Create or select a Draft day before saving the schedule.');return}await this.cloud.saveHeadSchedule(this.state.selectedDate(),this.rows)}else{if(!this.canEditResults){this.show(this.isWorker?'Incoming Material is read-only for workers.':'This schedule is not open for result corrections.');return}await this.cloud.submitOperationalResults(this.state.selectedDate(),this.rows)}this.rows=this.cloud.rows().map(row=>({...row}));this.cacheLocally();this.show(this.cloud.message());return}catch{this.show(this.cloud.message());return}}this.cacheLocally();this.show(this.isHead?'Schedule saved successfully.':'Results saved successfully.')}
private cacheLocally():void{const schedule=this.state.schedule()??this.state.empty();schedule.date=this.state.selectedDate();schedule.incoming=this.rows.map(row=>({...row,date:schedule.date}));this.state.save(schedule,this.state.mode())}
private show(message:string):void{this.message=message;setTimeout(()=>this.message='',3500)}
private blank():IncomingRow{return{id:'',date:this.state?.selectedDate()??new Date().toISOString().slice(0,10),material:'',materialType:'',quantity:0,unit:''}}
}
