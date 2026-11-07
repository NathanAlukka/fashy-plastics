import{DatePipe,JsonPipe,TitleCasePipe}from'@angular/common';
import{Component}from'@angular/core';
import{provideNativeDateAdapter}from'@angular/material/core';
import{MatDatepickerModule}from'@angular/material/datepicker';
import{ActivityLogService}from'../../services/activity-log.service';
import{AppStateService}from'../../services/app-state.service';

@Component({standalone:true,imports:[DatePipe,JsonPipe,TitleCasePipe,MatDatepickerModule],providers:[provideNativeDateAdapter()],templateUrl:'./activity-log.component.html',styleUrl:'./activity-log.component.scss'})
export class ActivityLogComponent{
  date:string;
  constructor(public logs:ActivityLogService,state:AppStateService){this.date=state.selectedDate();void this.load()}
  get selectedDate():Date{return new Date(this.date+'T00:00:00')}
  async selectDate(value:Date|null):Promise<void>{if(!value)return;this.date=value.getFullYear()+'-'+String(value.getMonth()+1).padStart(2,'0')+'-'+String(value.getDate()).padStart(2,'0');await this.load()}
  load():Promise<void>{return this.logs.loadDate(this.date)}
  timestamp(value:unknown):Date|null{if(value&&typeof value==='object'&&'toDate'in value)return(value as{toDate():Date}).toDate();return null}
  hasDetails(value:Record<string,unknown>):boolean{return Object.keys(value).length>0}
  change(entry:{action:string;section:string;details:Record<string,unknown>}):string{const detail=this.formatValue(entry.details);return`${entry.action} in ${entry.section}${detail==='None'?'':` — ${detail}`}`}
  formatValue(value:unknown,depth=0):string{
    if(value===null||value===undefined||value==='')return'None';
    if(typeof value==='boolean')return value?'Yes':'No';
    if(typeof value==='number')return String(value);
    if(typeof value==='string')return this.words(value);
    if(Array.isArray(value)){
      if(!value.length)return'None';
      const galaValues=value.length===6&&value.every(item=>item===null||['string','number'].includes(typeof item));
      return value.map((item,index)=>`${galaValues?'Gala '+(index+1):'Item '+(index+1)}: ${this.formatValue(item,depth+1)}`).join('\n');
    }
    if(typeof value==='object'){
      const entries=Object.entries(value as Record<string,unknown>);
      if(!entries.length)return'None';
      return entries.map(([key,item])=>`${this.label(key)}: ${this.formatValue(item,depth+1)}`).join(depth?' · ':'\n');
    }
    return String(value);
  }
  technical(entry:{recordId:string;previousValue:unknown;newValue:unknown;details:Record<string,unknown>}):unknown{return{recordId:entry.recordId,from:entry.previousValue,to:entry.newValue,details:entry.details}}
  private label(value:string):string{const labels:Record<string,string>={id:'Record ID',uid:'User ID',workerUid:'Worker ID',workerUids:'Worker IDs',galaNumber:'Gala number',materialType:'Material type',workType:'Work type',customDuty:'Custom duty',shiftNumber:'Session number',requiredQuantity:'Required quantity',plannedLot:'Planned lot',createdBy:'Created by',createdByName:'Created by name',sortOrder:'Row number'};return labels[value]??value.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/_/g,' ').replace(/^./,letter=>letter.toUpperCase())}
  private words(value:string):string{return value.replace(/_/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase())}
}
