import{DatePipe}from'@angular/common';
import{Component}from'@angular/core';
import{MatButtonModule}from'@angular/material/button';
import{provideNativeDateAdapter}from'@angular/material/core';
import{MatDatepickerModule}from'@angular/material/datepicker';
import{RouterLink}from'@angular/router';
import{AppStateService}from'../../services/app-state.service';
import{AuthService}from'../../services/auth.service';
import{DailyRecordService}from'../../services/daily-record.service';
import{DashboardDataService}from'../../services/dashboard-data.service';
import{MockDataService}from'../../services/mock-data.service';
import{WorkerMultiSelectComponent}from'../../shared/worker-multi-select/worker-multi-select.component';
import{CarryForwardService}from'../../services/carry-forward.service';
import{ActivityLogService}from'../../services/activity-log.service';

@Component({standalone:true,imports:[DatePipe,MatDatepickerModule,MatButtonModule,RouterLink,WorkerMultiSelectComponent],providers:[provideNativeDateAdapter()],templateUrl:'./dashboard.component.html',styleUrl:'./dashboard.component.scss'})
export class DashboardComponent{
private readonly peopleKey='fashyManagedWorkers';managedWorkers:string[]=[];message='';
constructor(public state:AppStateService,public data:MockDataService,public auth:AuthService,public daily:DailyRecordService,public dashboard:DashboardDataService,public carry:CarryForwardService,private audit:ActivityLogService){void this.loadDashboard()}
get selectedDate():Date{return new Date(`${this.state.selectedDate()}T00:00:00`)}
get hasSchedule():boolean{return this.auth.enabled?['published','completed'].includes(this.daily.record()?.status??''):!!this.state.schedule()?.createdByHead}
async selectDate(date:Date|null):Promise<void>{if(!date)return;this.state.setDate(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`);await this.loadDashboard()}
async setManagedWorkers(workers:string[]):Promise<void>{const previous=[...this.managedWorkers];this.managedWorkers=[...new Set(workers)];if(!await this.saveWorkers())this.managedWorkers=previous}
async removeWorker(name:string):Promise<void>{const previous=[...this.managedWorkers];this.managedWorkers=this.managedWorkers.filter(worker=>worker!==name);if(!await this.saveWorkers())this.managedWorkers=previous}
async createDraft():Promise<void>{const before=this.daily.record();await this.daily.createDraft(this.state.selectedDate());if(!before&&this.daily.record())await this.audit.recordMany(this.state.selectedDate(),'Dashboard','Draft created',[{recordId:this.state.selectedDate(),previousValue:null,newValue:{status:'draft'}}]);await this.loadDashboard()}
async publish():Promise<void>{if(this.daily.record()?.status==='day_off'){this.show('A day-off record cannot be published.');return}const before=this.daily.record()?.status;await this.daily.publish(this.state.selectedDate());if(this.daily.state()==='error')return;await this.audit.recordMany(this.state.selectedDate(),'Dashboard','Schedule published',[{recordId:this.state.selectedDate(),previousValue:{status:before},newValue:{status:'published'}}]);let result=await this.carry.carryToNextWorkingDay(this.state.selectedDate());if(result.needsConfirmation&&window.confirm(`${result.message}\n\nReplace the destination schedule? This cannot be undone.`))result=await this.carry.carryToNextWorkingDay(this.state.selectedDate(),true);if(result.copied)await this.audit.recordMany(this.state.selectedDate(),'Dashboard','Schedule carried forward',[{recordId:this.state.selectedDate(),newValue:result}]);this.show(result.message)}
async complete():Promise<void>{const before=this.daily.record()?.status;await this.daily.markCompleted(this.state.selectedDate());if(this.daily.state()!=='error')await this.audit.recordMany(this.state.selectedDate(),'Dashboard','Day completed',[{recordId:this.state.selectedDate(),previousValue:{status:before},newValue:{status:'completed'}}])}
async markDayOff():Promise<void>{if(this.daily.record()&&!window.confirm('Mark this date as a day off? Existing schedule records will be hidden but retained as history.'))return;const before=this.daily.record()?.status;await this.daily.markDayOff(this.state.selectedDate());if(this.daily.state()!=='error')await this.audit.recordMany(this.state.selectedDate(),'Dashboard','Day Off marked',[{recordId:this.state.selectedDate(),previousValue:{status:before},newValue:{status:'day_off'}}]);try{const result=await this.carry.carryPastDayOff(this.state.selectedDate());if(result?.copied)await this.audit.recordMany(this.state.selectedDate(),'Dashboard','Schedule carried forward',[{recordId:this.state.selectedDate(),newValue:result}]);this.show(result?.message??this.daily.message())}catch(error){this.show(error instanceof Error?error.message:this.daily.message())}await this.loadDashboard()}
async clearDayOff():Promise<void>{if(!window.confirm('Remove the day off and restore this date as an editable draft?'))return;await this.daily.clearDayOff(this.state.selectedDate());if(this.daily.state()!=='error')await this.audit.recordMany(this.state.selectedDate(),'Dashboard','Day Off removed',[{recordId:this.state.selectedDate(),previousValue:{status:'day_off'},newValue:{status:'draft'}}]);await this.loadDashboard()}
private async loadDashboard():Promise<void>{if(this.auth.enabled){await this.dashboard.load(this.state.selectedDate());this.managedWorkers=[...this.dashboard.summary().managedWorkers]}else this.loadLocalWorkers()}
private async saveWorkers():Promise<boolean>{if(this.auth.enabled){if(!this.daily.record()){this.show('Create a Draft before adding workers.');return false}try{const before=this.daily.record()?.managedWorkers??[];await this.dashboard.saveManagedWorkers(this.state.selectedDate(),this.managedWorkers);await this.audit.recordMany(this.state.selectedDate(),'Dashboard','Manage + Drill + Post updated',JSON.stringify(before)!==JSON.stringify(this.managedWorkers)?[{recordId:this.state.selectedDate(),previousValue:before,newValue:this.managedWorkers}]:[]);await this.daily.load(this.state.selectedDate());this.show('Daily worker roster saved.');return true}catch{this.show(this.dashboard.message());return false}}this.saveLocalWorkers();return true}
private loadLocalWorkers():void{try{const all=JSON.parse(localStorage.getItem(this.peopleKey)??'{}');this.managedWorkers=all[this.state.selectedDate()]??[]}catch{this.managedWorkers=[]}}
private saveLocalWorkers():void{let all:Record<string,string[]>={};try{all=JSON.parse(localStorage.getItem(this.peopleKey)??'{}')}catch{}all[this.state.selectedDate()]=this.managedWorkers;localStorage.setItem(this.peopleKey,JSON.stringify(all))}
private show(message:string):void{this.message=message;setTimeout(()=>this.message='',3500)}
}
