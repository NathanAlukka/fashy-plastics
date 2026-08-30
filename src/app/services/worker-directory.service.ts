import{Injectable,signal}from'@angular/core';
import type{Firestore}from'firebase/firestore';
import{firebaseConfig,firebaseConfigured}from'../../environments/environment';
import{MasterDataService}from'./master-data.service';

@Injectable({providedIn:'root'})
export class WorkerDirectoryService{
  readonly names=signal<string[]>([]);readonly loading=signal(false);
  constructor(private master:MasterDataService){}

  async load():Promise<void>{
    if(!firebaseConfigured){this.names.set([...this.master.data().workers]);return}
    this.loading.set(true);
    try{
      const firestore=await this.firestore();const{collection,getDocs,query,where}=await import('firebase/firestore');
      const snapshot=await getDocs(query(collection(firestore,'users'),where('active','==',true)));const currentNames=new Set(this.master.data().workers.map(name=>name.trim().toLocaleLowerCase()));
      const names=snapshot.docs.map(item=>item.data()).filter(data=>data['role']==='worker'&&typeof data['email']==='string'&&!!data['email']).map(data=>String(data['displayName']??'').trim()).filter(name=>!!name&&currentNames.has(name.toLocaleLowerCase()));
      this.names.set([...new Set(names)].sort((a,b)=>a.localeCompare(b)));
    }catch{
      const currentNames=new Set(this.master.data().workers.map(name=>name.trim().toLocaleLowerCase()));const configured=Object.keys(this.master.workerEmails()).filter(name=>currentNames.has(name.trim().toLocaleLowerCase()));
      this.names.set(configured.length?[...new Set(configured)].sort((a,b)=>a.localeCompare(b)):[...this.master.data().workers]);
    }finally{this.loading.set(false)}
  }

  private async firestore():Promise<Firestore>{const[{getApps,initializeApp},{getFirestore}]=await Promise.all([import('firebase/app'),import('firebase/firestore')]);return getFirestore(getApps()[0]??initializeApp(firebaseConfig))}
}
