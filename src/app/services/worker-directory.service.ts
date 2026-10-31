import{Injectable,signal}from'@angular/core';
import type{Firestore}from'firebase/firestore';
import{firebaseConfig,firebaseConfigured}from'../../environments/environment';
import{MasterDataService}from'./master-data.service';

@Injectable({providedIn:'root'})
export class WorkerDirectoryService{
  readonly names=signal<string[]>([]);readonly identities=signal<Record<string,string>>({});readonly loading=signal(false);
  constructor(private master:MasterDataService){}

  async load():Promise<void>{
    if(!firebaseConfigured){this.names.set([...this.master.data().workers]);this.identities.set({});return}
    this.loading.set(true);
    try{
      const firestore=await this.firestore();const{collection,getDocs,query,where}=await import('firebase/firestore');
      const snapshot=await getDocs(query(collection(firestore,'users'),where('active','==',true)));const currentNames=new Set(this.master.data().workers.map(name=>name.trim().toLocaleLowerCase()));
      const profiles=snapshot.docs.map(item=>({...item.data(),uid:item.id}as Record<string,unknown>&{uid:string})).filter(data=>['worker','controller'].includes(String(data['role']))&&typeof data['email']==='string'&&!!data['email']);const names=profiles.map(data=>String(data['displayName']??'').trim()).filter(name=>!!name&&currentNames.has(name.toLocaleLowerCase()));const identities:Record<string,string>={};for(const profile of profiles){const name=String(profile['displayName']??'').trim();if(name&&currentNames.has(name.toLocaleLowerCase())&&!identities[name.toLocaleLowerCase()])identities[name.toLocaleLowerCase()]=profile.uid}this.identities.set(identities);
      this.names.set([...new Set(names)].sort((a,b)=>a.localeCompare(b)));
    }catch{this.identities.set({});
      const currentNames=new Set(this.master.data().workers.map(name=>name.trim().toLocaleLowerCase()));const configured=Object.keys(this.master.workerEmails()).filter(name=>currentNames.has(name.trim().toLocaleLowerCase()));
      this.names.set(configured.length?[...new Set(configured)].sort((a,b)=>a.localeCompare(b)):[...this.master.data().workers]);
    }finally{this.loading.set(false)}
  }
  uidForName(name:string):string{return this.identities()[name.trim().toLocaleLowerCase()]??''}

  private async firestore():Promise<Firestore>{const[{getApps,initializeApp},{getFirestore}]=await Promise.all([import('firebase/app'),import('firebase/firestore')]);return getFirestore(getApps()[0]??initializeApp(firebaseConfig))}
}
