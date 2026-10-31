import{Injectable,signal}from'@angular/core';
import type{Firestore}from'firebase/firestore';
import{firebaseConfig,firebaseConfigured}from'../../environments/environment';
import{AuthService}from'./auth.service';

export interface MaterialConsumptionSummary{label:string;total:number}
export interface IncomingMaterialSummary{label:string;quantity:number;unit:string}
export interface DailyDashboardSummary{managedWorkers:string[];rawMaterials:MaterialConsumptionSummary[];incomingMaterials:IncomingMaterialSummary[];totalRaw:number;totalIncoming:number;totalCounted:number;totalActual:number;rejectionPercentage:number}

const EMPTY:DailyDashboardSummary={managedWorkers:[],rawMaterials:[],incomingMaterials:[],totalRaw:0,totalIncoming:0,totalCounted:0,totalActual:0,rejectionPercentage:0};

@Injectable({providedIn:'root'})
export class DashboardDataService{
readonly summary=signal<DailyDashboardSummary>(structuredClone(EMPTY));readonly loading=signal(false);readonly saving=signal(false);readonly message=signal('');
constructor(private auth:AuthService){}

async load(date:string):Promise<void>{if(!firebaseConfigured||!this.auth.user()){this.summary.set(structuredClone(EMPTY));return}this.loading.set(true);try{const firestore=await this.firestore();const{doc,getDoc}=await import('firebase/firestore');const record=await getDoc(doc(firestore,'daily_records',date));if(!record.exists()){this.summary.set(structuredClone(EMPTY));this.message.set('No cloud record exists for this date.');return}const workers=record.data()['managedWorkers'];this.summary.set({...structuredClone(EMPTY),managedWorkers:Array.isArray(workers)?workers.filter((value):value is string=>typeof value==='string'):[]});this.message.set('Daily roster loaded from Firebase.')}catch(error){this.summary.set(structuredClone(EMPTY));this.message.set(this.errorMessage(error))}finally{this.loading.set(false)}}

async saveManagedWorkers(date:string,workers:string[]):Promise<void>{if(this.auth.profile()?.role!=='head')throw new Error('Only a Head account can manage the daily worker roster.');this.saving.set(true);try{const firestore=await this.firestore();const{doc,serverTimestamp,updateDoc}=await import('firebase/firestore');await updateDoc(doc(firestore,'daily_records',date),{managedWorkers:[...workers],updatedAt:serverTimestamp()});this.summary.update(summary=>({...summary,managedWorkers:[...workers]}));this.message.set('Daily worker roster saved.')}catch(error){this.message.set(this.errorMessage(error));throw error}finally{this.saving.set(false)}}
private async firestore():Promise<Firestore>{const[{getApps,initializeApp},{getFirestore}]=await Promise.all([import('firebase/app'),import('firebase/firestore')]);return getFirestore(getApps()[0]??initializeApp(firebaseConfig))}
private errorMessage(error:unknown):string{return error instanceof Error?error.message:'Unable to load the dashboard.'}
}
