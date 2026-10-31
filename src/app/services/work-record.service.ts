import{Injectable,signal}from'@angular/core';
import type{Firestore}from'firebase/firestore';
import{firebaseConfig,firebaseConfigured}from'../../environments/environment';
import{WipRow}from'../models';
import{ActivityLogService}from'./activity-log.service';
import{AuthService}from'./auth.service';

export interface CloudWorkEntry extends WipRow{source:'head'|'worker';createdBy:string;createdByName:string;sortOrder:number}

@Injectable({providedIn:'root'})
export class WorkRecordService{
  readonly rows=signal<CloudWorkEntry[]>([]);readonly loading=signal(false);readonly message=signal('');
  constructor(private auth:AuthService,private audit:ActivityLogService){}

  async load(date:string):Promise<CloudWorkEntry[]>{
    if(!firebaseConfigured||!this.auth.user()){this.rows.set([]);return[]}
    this.loading.set(true);
    try{const firestore=await this.firestore();const{collection,getDocs}=await import('firebase/firestore');const snapshot=await getDocs(collection(firestore,'daily_records',date,'work_entries'));const rows=snapshot.docs.map((item,index)=>this.normalize(item.id,item.data(),date,index)).sort((a,b)=>a.sortOrder-b.sortOrder);this.rows.set(rows);this.message.set(rows.length?'Work assignments loaded.':'No Work rows have been scheduled.');return rows}
    catch(error){this.rows.set([]);this.message.set(this.errorMessage(error));return[]}
    finally{this.loading.set(false)}
  }

  async saveHeadSchedule(date:string,rows:WipRow[]):Promise<void>{
    this.requireHead();this.loading.set(true);const before=[...this.rows()];
    try{const firestore=await this.firestore();const{collection,doc,getDocs,serverTimestamp,writeBatch}=await import('firebase/firestore');const ref=collection(firestore,'daily_records',date,'work_entries');const existing=await getDocs(ref);const wanted=new Set(rows.map(row=>row.id));const batch=writeBatch(firestore);for(const item of existing.docs)if(item.data()['source']!=='worker'&&!wanted.has(item.id))batch.delete(item.ref);const profile=this.auth.profile()!;
      rows.forEach((row,index)=>{const old=existing.docs.find(item=>item.id===row.id)?.data();batch.set(doc(ref,row.id),{id:row.id,date,galaNumber:row.galaNumber,worker:row.worker,workerUid:row.workerUid??'',workType:row.workType,part:row.part,task:row.task,duty:row.duty,customDuty:row.customDuty,quantity:old?.['quantity']??null,unit:old?.['unit']??'',source:'head',createdBy:old?.['createdBy']??profile.uid,createdByName:old?.['createdByName']??profile.displayName,sortOrder:index,createdAt:old?.['createdAt']??serverTimestamp(),updatedAt:serverTimestamp()},{merge:true})});
      await batch.commit();await this.audit.recordMany(date,'Work','Schedule updated',this.rowChanges(before,rows,false));await this.load(date);this.message.set('Work schedule saved to Firebase.')
    }catch(error){this.message.set(this.errorMessage(error));throw error}finally{this.loading.set(false)}
  }

  async submitOperationalResults(date:string,rows:WipRow[]):Promise<void>{
    const profile=this.auth.profile();if(!profile||!['head','controller','worker'].includes(profile.role))throw new Error('An active application account is required.');this.loading.set(true);const before=[...this.rows()];
    try{const firestore=await this.firestore();const{collection,doc,serverTimestamp,writeBatch}=await import('firebase/firestore');const ref=collection(firestore,'daily_records',date,'work_entries');const existing=new Map(before.map(row=>[row.id,row]));const permitted=rows.filter(row=>{const stored=existing.get(row.id);return!!stored&&(profile.role==='head'||profile.role==='controller'||stored.workerUid===profile.uid)});if(!permitted.length)throw new Error('No Work records are assigned to this account.');const batch=writeBatch(firestore);for(const row of permitted)batch.update(doc(ref,row.id),{quantity:row.quantity,unit:row.unit,updatedAt:serverTimestamp(),submittedBy:profile.uid,submittedByName:profile.displayName});await batch.commit();await this.audit.recordMany(date,'Work',profile.role==='controller'?'Controller correction':'Result updated',this.rowChanges(before,permitted,true));await this.load(date);this.message.set(profile.role==='controller'?'Work corrections saved.':'Work results submitted.')
    }catch(error){this.message.set(this.errorMessage(error));throw error}finally{this.loading.set(false)}
  }

  private rowChanges(before:WipRow[],after:WipRow[],resultsOnly:boolean){const previous=new Map(before.map(row=>[row.id,row]));const next=new Map(after.map(row=>[row.id,row]));const ids=new Set([...previous.keys(),...next.keys()]);return[...ids].flatMap(id=>{const old=previous.get(id),value=next.get(id);const oldValue=resultsOnly&&old?{quantity:old.quantity,unit:old.unit}:old??null;const newValue=resultsOnly&&value?{quantity:value.quantity,unit:value.unit}:value??null;return JSON.stringify(oldValue)!==JSON.stringify(newValue)?[{recordId:id,previousValue:oldValue,newValue,details:{gala:value?.galaNumber??old?.galaNumber??'',worker:value?.worker??old?.worker??''}}]:[]})}
  private normalize(id:string,data:Record<string,unknown>,date:string,index:number):CloudWorkEntry{const source=data['source']==='worker'?'worker':'head';const createdBy=String(data['createdBy']??'');return{id,date,galaNumber:String(data['galaNumber']??''),worker:String(data['worker']??''),workerUid:String(data['workerUid']??(source==='worker'?createdBy:'')),workType:data['workType']==='Duty'?'Duty':data['workType']==='Absent'?'Absent':'Part Work',part:String(data['part']??''),task:String(data['task']??''),duty:String(data['duty']??''),customDuty:String(data['customDuty']??''),quantity:typeof data['quantity']==='number'?data['quantity']:null,unit:String(data['unit']??''),source,createdBy,createdByName:String(data['createdByName']??''),sortOrder:typeof data['sortOrder']==='number'?data['sortOrder']:index}}
  private requireHead():void{if(this.auth.profile()?.role!=='head')throw new Error('Only Head can save schedules.')}
  private async firestore():Promise<Firestore>{const[{getApps,initializeApp},{getFirestore}]=await Promise.all([import('firebase/app'),import('firebase/firestore')]);return getFirestore(getApps()[0]??initializeApp(firebaseConfig))}
  private errorMessage(error:unknown):string{return error instanceof Error?error.message:'Unable to synchronize Work records.'}
}
