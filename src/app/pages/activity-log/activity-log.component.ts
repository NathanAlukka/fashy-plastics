import{DatePipe,JsonPipe}from'@angular/common';
import{Component}from'@angular/core';
import{provideNativeDateAdapter}from'@angular/material/core';
import{MatDatepickerModule}from'@angular/material/datepicker';
import{ActivityLogService}from'../../services/activity-log.service';
import{AppStateService}from'../../services/app-state.service';

@Component({standalone:true,imports:[DatePipe,JsonPipe,MatDatepickerModule],providers:[provideNativeDateAdapter()],templateUrl:'./activity-log.component.html',styleUrl:'./activity-log.component.scss'})
export class ActivityLogComponent{
  date:string;
  constructor(public logs:ActivityLogService,state:AppStateService){this.date=state.selectedDate();void this.load()}
  get selectedDate():Date{return new Date(this.date+'T00:00:00')}
  async selectDate(value:Date|null):Promise<void>{if(!value)return;this.date=value.getFullYear()+'-'+String(value.getMonth()+1).padStart(2,'0')+'-'+String(value.getDate()).padStart(2,'0');await this.load()}
  load():Promise<void>{return this.logs.loadDate(this.date)}
  timestamp(value:unknown):Date|null{if(value&&typeof value==='object'&&'toDate'in value)return(value as{toDate():Date}).toDate();return null}
  hasDetails(value:Record<string,unknown>):boolean{return Object.keys(value).length>0}
}
