import{Injectable,signal}from'@angular/core';
import type{Firestore}from'firebase/firestore';
import{firebaseConfig}from'../../environments/environment';
import{UserProfile}from'../models';
import{AuthService}from'./auth.service';
import{MasterDataService}from'./master-data.service';
import{WorkerDirectoryService}from'./worker-directory.service';
import{ActivityLogService}from'./activity-log.service';
export interface ManagedEmployee extends UserProfile{registered:boolean}

@Injectable({providedIn:'root'})
export class EmployeeAdminService{
  readonly employees=signal<ManagedEmployee[]>([]);readonly loading=signal(false);readonly message=signal('');
  constructor(private auth:AuthService,private master:MasterDataService,private directory:WorkerDirectoryService,private audit:ActivityLogService){}

  async load():Promise<void>{
    this.requireHead();this.loading.set(true);
    try{const firestore=await this.firestore();const{collection,getDocs}=await import('firebase/firestore');const snapshot=await getDocs(collection(firestore,'users'));const profiles=snapshot.docs.map(item=>{const data=item.data();return{uid:item.id,email:String(data['email']??''),displayName:String(data['displayName']??''),role:data['role']==='head'?'head':data['role']==='controller'?'controller':'worker',active:data['active']!==false,registered:true}as ManagedEmployee});const registeredNames=new Set(profiles.map(employee=>employee.displayName.toLocaleLowerCase()));const unregistered=this.master.data().workers.filter(name=>!registeredNames.has(name.toLocaleLowerCase())).map(name=>({uid:'unregistered:'+name,email:this.auth.loginEmailForName(name),displayName:name,role:'worker' as const,active:true,registered:false}));const employees=[...profiles,...unregistered].sort((a,b)=>a.role===b.role?a.displayName.localeCompare(b.displayName):a.role==='head'?-1:1);this.employees.set(employees);this.message.set('Employee list loaded.')}
      catch(error){this.message.set(this.errorMessage(error));throw error}finally{this.loading.set(false)}
  }

  async add(name:string,pin:string,controllerAccess=false):Promise<void>{
    this.requireHead();const displayName=name.trim();if(!displayName)throw new Error('Enter the employee name.');if(displayName.toLocaleLowerCase()==='fashy')throw new Error('Fashy is the protected Head account.');if(!/^\d{6}$/.test(pin))throw new Error('Enter a six-digit PIN.');if(this.employees().some(employee=>employee.registered&&employee.displayName.toLocaleLowerCase()===displayName.toLocaleLowerCase()))throw new Error('An employee with this name already has a login.');this.loading.set(true);let createdUser:import('firebase/auth').User|null=null;
    try{const[{initializeApp,deleteApp},{createUserWithEmailAndPassword,deleteUser,getAuth,signOut}]=await Promise.all([import('firebase/app'),import('firebase/auth')]);const secondary=initializeApp(firebaseConfig,'employee-'+crypto.randomUUID());const secondaryAuth=getAuth(secondary);try{const credential=await createUserWithEmailAndPassword(secondaryAuth,this.auth.loginEmailForName(displayName),pin);createdUser=credential.user;const firestore=await this.firestore();const{doc,serverTimestamp,writeBatch}=await import('firebase/firestore');const workers=this.withWorker(displayName);const emails={...this.master.workerEmails(),[displayName]:createdUser.email??this.auth.loginEmailForName(displayName)};const controllers=this.controllerList(displayName,controllerAccess);const batch=writeBatch(firestore);batch.set(doc(firestore,'users',createdUser.uid),{uid:createdUser.uid,email:createdUser.email,displayName,role:controllerAccess?'controller':'worker',active:true,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});batch.set(doc(firestore,'master_data','workers'),{values:workers,emails,controllers,updatedAt:serverTimestamp()},{merge:true});await batch.commit();await signOut(secondaryAuth)}catch(error){if(createdUser)await deleteUser(createdUser).catch(()=>undefined);throw error}finally{await deleteApp(secondary)}await this.refresh();this.message.set(displayName+' was added successfully'+(controllerAccess?' with Controller access.':'.'))}
    catch(error){this.message.set(this.errorMessage(error));throw error}finally{this.loading.set(false)}
  }

  async setController(employee:ManagedEmployee,enabled:boolean):Promise<void>{
    this.requireHead();if(!employee.registered||employee.role==='head')throw new Error('Set up this employee login before enabling Controller access.');this.loading.set(true);
    try{const firestore=await this.firestore();const{doc,serverTimestamp,writeBatch}=await import('firebase/firestore');const batch=writeBatch(firestore);batch.update(doc(firestore,'users',employee.uid),{role:enabled?'controller':'worker',updatedAt:serverTimestamp()});batch.set(doc(firestore,'master_data','workers'),{controllers:this.controllerList(employee.displayName,enabled),updatedAt:serverTimestamp()},{merge:true});await batch.commit();await this.refresh();this.message.set(employee.displayName+(enabled?' can now use Controller Mode.':' no longer has Controller access.'))}
    catch(error){this.message.set(this.errorMessage(error));throw error}finally{this.loading.set(false)}
  }

  async remove(employee:ManagedEmployee):Promise<void>{
    this.requireHead();if(employee.role==='head'||employee.displayName.toLocaleLowerCase()==='fashy')throw new Error('The Head account cannot be removed.');this.loading.set(true);
    try{const firestore=await this.firestore();const{doc,serverTimestamp,writeBatch}=await import('firebase/firestore');const workers=this.master.data().workers.filter(name=>name.toLocaleLowerCase()!==employee.displayName.toLocaleLowerCase());const batch=writeBatch(firestore);if(employee.registered)batch.update(doc(firestore,'users',employee.uid),{active:false,role:'worker',updatedAt:serverTimestamp()});batch.set(doc(firestore,'master_data','workers'),{values:workers,emails:this.withoutEmail(employee.displayName),controllers:this.controllerList(employee.displayName,false),updatedAt:serverTimestamp()},{merge:true});await batch.commit();await this.refresh();this.message.set(employee.displayName+' was removed from the company list.')}
    catch(error){this.message.set(this.errorMessage(error));throw error}finally{this.loading.set(false)}
  }

  async reactivate(employee:ManagedEmployee):Promise<void>{
    this.requireHead();this.loading.set(true);
    try{const firestore=await this.firestore();const{doc,serverTimestamp,writeBatch}=await import('firebase/firestore');const batch=writeBatch(firestore);batch.update(doc(firestore,'users',employee.uid),{active:true,updatedAt:serverTimestamp()});batch.set(doc(firestore,'master_data','workers'),{values:this.withWorker(employee.displayName),emails:{...this.master.workerEmails(),[employee.displayName]:employee.email},controllers:this.controllerList(employee.displayName,employee.role==='controller'),updatedAt:serverTimestamp()},{merge:true});await batch.commit();await this.refresh();this.message.set(employee.displayName+' was reactivated. Their existing PIN remains valid.')}
    catch(error){this.message.set(this.errorMessage(error));throw error}finally{this.loading.set(false)}
  }

  async rename(employee:ManagedEmployee,name:string):Promise<void>{
    this.requireHead();const displayName=name.trim();if(employee.role==='head'||employee.displayName.toLocaleLowerCase()==='fashy')throw new Error('The Head account cannot be renamed here.');if(!displayName)throw new Error('Enter the employee name.');if(this.employees().some(item=>item.uid!==employee.uid&&item.displayName.toLocaleLowerCase()===displayName.toLocaleLowerCase()))throw new Error('That employee name is already in use.');this.loading.set(true);
    try{const firestore=await this.firestore();const{doc,serverTimestamp,writeBatch}=await import('firebase/firestore');const linkedNames=new Set(Object.entries(this.master.workerEmails()).filter(([,email])=>!!employee.email&&email.toLocaleLowerCase()===employee.email.toLocaleLowerCase()).map(([worker])=>worker.toLocaleLowerCase()));linkedNames.add(employee.displayName.toLocaleLowerCase());const workers=[...this.master.data().workers.filter(value=>!linkedNames.has(value.toLocaleLowerCase())&&value.toLocaleLowerCase()!==displayName.toLocaleLowerCase()),displayName];const emails=Object.fromEntries(Object.entries(this.master.workerEmails()).filter(([worker,email])=>!linkedNames.has(worker.toLocaleLowerCase())&&email.toLocaleLowerCase()!==employee.email.toLocaleLowerCase()));if(employee.registered)emails[displayName]=employee.email;const controllers=this.master.controllerNames().filter(value=>value.toLocaleLowerCase()!==employee.displayName.toLocaleLowerCase());if(employee.role==='controller')controllers.push(displayName);const batch=writeBatch(firestore);if(employee.registered)batch.update(doc(firestore,'users',employee.uid),{displayName,updatedAt:serverTimestamp()});batch.set(doc(firestore,'master_data','workers'),{values:workers,emails,controllers:[...new Set(controllers)],updatedAt:serverTimestamp()},{merge:true});await batch.commit();await this.refresh();this.message.set(employee.displayName+' was renamed to '+displayName+'.')}
    catch(error){this.message.set(this.errorMessage(error));throw error}finally{this.loading.set(false)}
  }

  private async refresh():Promise<void>{await this.master.load();await this.directory.load();await this.load()}
  private controllerList(name:string,enabled:boolean):string[]{const lower=name.toLocaleLowerCase();const values=this.master.controllerNames().filter(value=>value.toLocaleLowerCase()!==lower);if(enabled)values.push(name);return[...new Set(values)]}
  private withWorker(name:string):string[]{const workers=this.master.data().workers;return workers.some(value=>value.toLocaleLowerCase()===name.toLocaleLowerCase())?[...workers]:[...workers,name]}
  private withoutEmail(name:string):Record<string,string>{return Object.fromEntries(Object.entries(this.master.workerEmails()).filter(([worker])=>worker.toLocaleLowerCase()!==name.toLocaleLowerCase()))}
  private requireHead():void{if(this.auth.profile()?.role!=='head')throw new Error('Only Fashy can manage employees.')}
  private async firestore():Promise<Firestore>{const[{getApps,initializeApp},{getFirestore}]=await Promise.all([import('firebase/app'),import('firebase/firestore')]);return getFirestore(getApps()[0]??initializeApp(firebaseConfig))}
  private errorMessage(error:unknown):string{const code=typeof error==='object'&&error&&'code'in error?String((error as{code:unknown}).code):'';if(code.includes('email-already-in-use'))return'An Authentication account already uses this employee name.';if(code.includes('weak-password'))return'The PIN must contain exactly six digits.';if(code.includes('permission-denied'))return'Firebase denied this change. Deploy the latest Firestore rules.';return error instanceof Error?error.message:'Unable to update the employee list.'}
}
