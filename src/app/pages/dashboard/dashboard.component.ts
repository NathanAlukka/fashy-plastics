import{DatePipe}from'@angular/common';
import{Component}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{MatButtonModule}from'@angular/material/button';
import{provideNativeDateAdapter}from'@angular/material/core';
import{MatDatepickerModule}from'@angular/material/datepicker';
import{RouterLink}from'@angular/router';
import{AppStateService}from'../../services/app-state.service';
import{AuthService}from'../../services/auth.service';
import{DailyRecordService}from'../../services/daily-record.service';
import{DashboardDataService}from'../../services/dashboard-data.service';
import{MockDataService}from'../../services/mock-data.service';
import{SearchableSelectComponent}from'../../shared/searchable-select/searchable-select.component';

@Component({standalone:true,imports:[DatePipe,FormsModule,MatDatepickerModule,MatButtonModule,RouterLink,SearchableSelectComponent],providers:[provideNativeDateAdapter()],templateUrl:'./dashboard.component.html',styleUrl:'./dashboard.component.scss'})
export class DashboardComponent{
private readonly peopleKey='fashyManagedWorkers';workerToAdd='';managedWorkers:string[]=[];message='';
constructor(public state:AppStateService,public data:MockDataService,public auth:AuthService,public daily:DailyRecordService,public dashboard:DashboardDataService){void this.loadDashboard()}
get selectedDate():Date{return new Date(`${this.state.selectedDate()}T00:00:00`)}
get hasSchedule():boolean{return this.auth.enabled?['published','completed'].includes(this.daily.record()?.status??''):!!this.state.schedule()?.createdByHead}
get availableWorkers():string[]{return this.data.workers.filter(name=>!this.managedWorkers.includes(name))}
async selectDate(date:Date|null):Promise<void>{if(!date)return;this.state.setDate(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`);await this.loadDashboard()}
async addWorker():Promise<void>{if(!this.workerToAdd||this.managedWorkers.includes(this.workerToAdd))return;const previous=[...this.managedWorkers];this.managedWorkers=[...this.managedWorkers,this.workerToAdd];this.workerToAdd='';if(!await this.saveWorkers())this.managedWorkers=previous}
async removeWorker(name:string):Promise<void>{const previous=[...this.managedWorkers];this.managedWorkers=this.managedWorkers.filter(worker=>worker!==name);if(!await this.saveWorkers())this.managedWorkers=previous}
async createDraft():Promise<void>{await this.daily.createDraft(this.state.selectedDate());await this.loadDashboard()}
publish():void{void this.daily.publish(this.state.selectedDate())}
complete():void{void this.daily.markCompleted(this.state.selectedDate())}
private async loadDashboard():Promise<void>{if(this.auth.enabled){await this.dashboard.load(this.state.selectedDate());this.managedWorkers=[...this.dashboard.summary().managedWorkers]}else this.loadLocalWorkers()}
private async saveWorkers():Promise<boolean>{if(this.auth.enabled){if(!this.daily.record()){this.show('Create a Draft before adding workers.');return false}try{await this.dashboard.saveManagedWorkers(this.state.selectedDate(),this.managedWorkers);await this.daily.load(this.state.selectedDate());this.show('Daily worker roster saved.');return true}catch{this.show(this.dashboard.message());return false}}this.saveLocalWorkers();return true}
private loadLocalWorkers():void{try{const all=JSON.parse(localStorage.getItem(this.peopleKey)??'{}');this.managedWorkers=all[this.state.selectedDate()]??[]}catch{this.managedWorkers=[]}}
private saveLocalWorkers():void{let all:Record<string,string[]>={};try{all=JSON.parse(localStorage.getItem(this.peopleKey)??'{}')}catch{}all[this.state.selectedDate()]=this.managedWorkers;localStorage.setItem(this.peopleKey,JSON.stringify(all))}
private show(message:string):void{this.message=message;setTimeout(()=>this.message='',3500)}
}
