import{Injectable,signal}from'@angular/core';
import type{Firestore}from'firebase/firestore';
import{firebaseConfig,firebaseConfigured}from'../../environments/environment';
import{AuthService}from'./auth.service';

export interface ActivityLogEntry{id:string;recordDate:string;section:string;action:string;recordId:string;previousValue:unknown;newValue:unknown;details:Record<string,unknown>;actorName:string;actorUid:string;actorRole:string;createdAt:unknown}
export interface ActivityChange{recordId:string;previousValue?:unknown;newValue?:unknown;details?:Record<string,unknown>}

@Injectable({providedIn:'root'})
export class ActivityLogService{
  readonly entries=signal<ActivityLogEntry[]>([]);readonly loading=signal(false);readonly message=signal('');
  constructor(private auth:AuthService){}

  async recordMany(recordDate:string,section:string,action:string,changes:ActivityChange[]):Promise<void>{
    const profile=this.auth.profile();if(!firebaseConfigured||!profile||!changes.length)return;
    try{const firestore=await this.firestore();const{collection,doc,serverTimestamp,writeBatch}=await import('firebase/firestore');for(let offset=0;offset<changes.length;offset+=400){const batch=writeBatch(firestore);for(const change of changes.slice(offset,offset+400)){const reference=doc(collection(firestore,'activity_logs'));batch.set(reference,{recordDate,section,action,recordId:change.recordId,previousValue:this.safeValue(change.previousValue),newValue:this.safeValue(change.newValue),details:this.safeValue(change.details)??{},actorName:profile.displayName,actorUid:profile.uid,actorRole:profile.role,createdAt:serverTimestamp()})}await batch.commit()}}
    catch(error){const message=error instanceof Error?error.message:'Unknown logging error';this.message.set('Activity logging failed: '+message);console.error('Activity log write failed',error)}
  }

  async loadDate(recordDate:string):Promise<void>{
    if(!firebaseConfigured||this.auth.profile()?.role!=='head'||!recordDate){this.entries.set([]);return}
    this.loading.set(true);this.message.set('');
    try{const firestore=await this.firestore();const{collection,getDocs,query,where}=await import('firebase/firestore');const snapshot=await getDocs(query(collection(firestore,'activity_logs'),where('recordDate','==',recordDate)));const entries=snapshot.docs.map(item=>this.normalize(item.id,item.data())).sort((a,b)=>this.millis(b.createdAt)-this.millis(a.createdAt));this.entries.set(entries);this.message.set(entries.length?String(entries.length)+' change'+(entries.length===1?'':'s')+' recorded.':'')}
    catch(error){this.entries.set([]);this.message.set(error instanceof Error?error.message:'Unable to load activity logs.')}
    finally{this.loading.set(false)}
  }

  private millis(value:unknown):number{if(value&&typeof value==='object'&&'toMillis'in value)return(value as{toMillis():number}).toMillis();return 0}
  private safeValue(value:unknown):unknown{if(value===undefined)return null;if(value===null||typeof value!=='object')return value;if(value instanceof Date||'toMillis'in value)return value;if(Array.isArray(value))return value.map(item=>this.safeValue(item));return Object.fromEntries(Object.entries(value as Record<string,unknown>).map(([key,item])=>[key,this.safeValue(item)]))}
  private normalize(id:string,data:Record<string,unknown>):ActivityLogEntry{return{id,recordDate:String(data['recordDate']??''),section:String(data['section']??''),action:String(data['action']??''),recordId:String(data['recordId']??''),previousValue:data['previousValue'],newValue:data['newValue'],details:typeof data['details']==='object'&&data['details']?data['details']as Record<string,unknown>:{},actorName:String(data['actorName']??''),actorUid:String(data['actorUid']??''),actorRole:String(data['actorRole']??''),createdAt:data['createdAt']}}
  private async firestore():Promise<Firestore>{const[{getApps,initializeApp},{getFirestore}]=await Promise.all([import('firebase/app'),import('firebase/firestore')]);return getFirestore(getApps()[0]??initializeApp(firebaseConfig))}
}
