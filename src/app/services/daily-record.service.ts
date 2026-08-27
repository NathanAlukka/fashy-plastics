import{Injectable,signal}from'@angular/core';import type{Firestore}from'firebase/firestore';import{firebaseConfig,firebaseConfigured}from'../../environments/environment';import{AuthService}from'./auth.service';

export type DailyRecordStatus='draft'|'published'|'completed';
export interface DailyRecord{date:string;status:DailyRecordStatus;createdBy:string;createdByName:string;managedWorkers:string[];createdAt?:unknown;updatedAt?:unknown;publishedAt?:unknown;completedAt?:unknown}
export type DailyRecordLoadState='idle'|'loading'|'ready'|'saving'|'error';

@Injectable({providedIn:'root'})
export class DailyRecordService{
readonly record=signal<DailyRecord|null>(null);readonly state=signal<DailyRecordLoadState>('idle');readonly message=signal('');private requestId=0;
constructor(private auth:AuthService){}

async load(date:string):Promise<void>{if(!firebaseConfigured||!this.auth.user()){this.clear();return}const request=++this.requestId;this.state.set('loading');try{const firestore=await this.firestore();const{doc,getDoc}=await import('firebase/firestore');const snapshot=await getDoc(doc(firestore,'daily_records',date));if(request!==this.requestId)return;if(snapshot.exists()){this.record.set(this.normalize(snapshot.data(),date));this.message.set('Daily record loaded.')}else{this.record.set(null);this.message.set('No schedule record exists for this date.')}this.state.set('ready')}catch(error){if(request!==this.requestId)return;const code=this.errorCode(error);if(code.includes('permission-denied')&&this.auth.profile()?.role==='worker'){this.record.set(null);this.state.set('ready');this.message.set('No published schedule is available for this date.');return}this.state.set('error');this.message.set(this.errorMessage(error))}}

async createDraft(date:string):Promise<void>{this.requireHead();this.state.set('saving');try{const firestore=await this.firestore();const{doc,getDoc,serverTimestamp,setDoc}=await import('firebase/firestore');const reference=doc(firestore,'daily_records',date);const existing=await getDoc(reference);if(existing.exists()){this.record.set(this.normalize(existing.data(),date));this.state.set('ready');this.message.set('A daily record already exists for this date.');return}const profile=this.auth.profile()!;await setDoc(reference,{date,status:'draft',createdBy:profile.uid,createdByName:profile.displayName,managedWorkers:[],createdAt:serverTimestamp(),updatedAt:serverTimestamp()});await this.load(date);this.message.set('Draft schedule created.')}catch(error){this.fail(error)}}

async publish(date:string):Promise<void>{this.requireHead();this.state.set('saving');try{const firestore=await this.firestore();const{doc,serverTimestamp,setDoc}=await import('firebase/firestore');const profile=this.auth.profile()!;await setDoc(doc(firestore,'daily_records',date),{date,status:'published',createdBy:this.record()?.createdBy??profile.uid,createdByName:this.record()?.createdByName??profile.displayName,createdAt:this.record()?.createdAt??serverTimestamp(),updatedAt:serverTimestamp(),publishedAt:serverTimestamp()},{merge:true});await this.load(date);this.message.set('Schedule published to workers.')}catch(error){this.fail(error)}}

async markCompleted(date:string):Promise<void>{this.requireHead();this.state.set('saving');try{const firestore=await this.firestore();const{doc,serverTimestamp,updateDoc}=await import('firebase/firestore');await updateDoc(doc(firestore,'daily_records',date),{status:'completed',updatedAt:serverTimestamp(),completedAt:serverTimestamp()});await this.load(date);this.message.set('Daily record marked completed.')}catch(error){this.fail(error)}}

clear():void{this.requestId++;this.record.set(null);this.state.set('idle');this.message.set('')}
private requireHead():void{if(this.auth.profile()?.role!=='head')throw new Error('Only a Head account can manage daily schedules.')}
private normalize(data:Record<string,unknown>,date:string):DailyRecord{const workers=data['managedWorkers'];return{date:String(data['date']??date),status:data['status']==='completed'?'completed':data['status']==='published'?'published':'draft',createdBy:String(data['createdBy']??''),createdByName:String(data['createdByName']??'Head'),managedWorkers:Array.isArray(workers)?workers.filter((value):value is string=>typeof value==='string'):[],createdAt:data['createdAt'],updatedAt:data['updatedAt'],publishedAt:data['publishedAt'],completedAt:data['completedAt']}}
private async firestore():Promise<Firestore>{const[{getApps,initializeApp},{getFirestore}]=await Promise.all([import('firebase/app'),import('firebase/firestore')]);return getFirestore(getApps()[0]??initializeApp(firebaseConfig))}
private fail(error:unknown):void{this.state.set('error');this.message.set(this.errorMessage(error))}
private errorCode(error:unknown):string{return typeof error==='object'&&error&&'code'in error?String((error as{code:unknown}).code):''}
private errorMessage(error:unknown):string{return error instanceof Error?error.message:'Unable to update the daily record.'}
}
