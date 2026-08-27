import{Injectable,signal}from'@angular/core';import{AppMode,DailySchedule}from'../models';
@Injectable({providedIn:'root'})export class AppStateService{
private readonly scheduleKey='fashyDailySchedules';private readonly modeKey='fashyMode';private readonly dateKey='fashySelectedDate';
readonly mode=signal<AppMode>(this.read(this.modeKey,'worker'));readonly selectedDate=signal<string>(this.read(this.dateKey,this.today()));readonly schedules=signal<Record<string,DailySchedule>>(this.read(this.scheduleKey,{}));
setMode(mode:AppMode):void{this.mode.set(mode);localStorage.setItem(this.modeKey,JSON.stringify(mode))}
setDate(date:string):void{this.selectedDate.set(date);localStorage.setItem(this.dateKey,JSON.stringify(date))}
schedule(date=this.selectedDate()):DailySchedule|undefined{return this.schedules()[date]}
empty(date=this.selectedDate()):DailySchedule{return{date,work:[],powder:[],output:[],incoming:[],createdByHead:false}}
save(schedule:DailySchedule,actor:AppMode):void{const now=new Date().toISOString();const next={...schedule,createdByHead:actor==='head'?true:schedule.createdByHead,...(actor==='head'?{headSavedAt:now}:{workerUpdatedAt:now})};const all={...this.schedules(),[schedule.date]:next};this.schedules.set(all);localStorage.setItem(this.scheduleKey,JSON.stringify(all))}
private today():string{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
private read<T>(key:string,fallback:T):T{try{const value=localStorage.getItem(key);return value?JSON.parse(value)as T:fallback}catch{return fallback}}
}
