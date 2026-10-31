import{Injectable,signal}from'@angular/core';
import type{Auth,User}from'firebase/auth';
import type{Firestore}from'firebase/firestore';
import{firebaseConfig,firebaseConfigured}from'../../environments/environment';
import{UserProfile}from'../models';
import{AppStateService}from'./app-state.service';
import{MasterDataService}from'./master-data.service';

@Injectable({providedIn:'root'})
export class AuthService{
  readonly enabled=firebaseConfigured;
  readonly loading=signal(firebaseConfigured);
  readonly user=signal<User|null>(null);
  readonly profile=signal<UserProfile|null>(null);
  readonly error=signal('');
  private auth?:Auth;private firestore?:Firestore;private readyResolver!:()=>void;
  private readonly readyPromise=new Promise<void>(resolve=>this.readyResolver=resolve);

  constructor(private state:AppStateService,private masterData:MasterDataService){if(this.enabled)this.initialize();else{this.loading.set(false);this.readyResolver()}}

  whenReady():Promise<void>{return this.readyPromise}

  loginEmailForName(name:string):string{return this.masterData.loginEmailForName(name)}

  async signInWithPin(name:string,pin:string,expectedRole?:'head'|'controller'|'worker'):Promise<void>{if(!/^\d{6}$/.test(pin)){this.error.set('Enter a six-digit PIN.');throw new Error('Enter a six-digit PIN.')}await this.signIn(this.loginEmailForName(name),pin);const role=this.profile()?.role;const allowed=!expectedRole||role===expectedRole||expectedRole==='controller'&&role==='head';if(!allowed){await this.signOut();const message=expectedRole==='head'?'This PIN does not belong to the Head account.':expectedRole==='controller'?'This account is not authorized as a Controller.':'This account is not registered as a Worker.';this.error.set(message);throw new Error(message)}if(expectedRole==='controller'&&role==='head')this.state.setMode('controller')}

  async signIn(email:string,password:string):Promise<void>{
    this.error.set('');
    try{
      await this.ensureInitialized();
      const{signInWithEmailAndPassword}=await import('firebase/auth');
      const credential=await signInWithEmailAndPassword(this.auth!,email.trim(),password);
      await this.applyUser(credential.user);
      if(!this.profile()){await this.signOut();throw new Error('This account has no application profile.')}
      if(!this.profile()?.active){await this.signOut();throw new Error('This account is inactive.')}
    }catch(error){const message=this.friendlyError(error);this.error.set(message);throw new Error(message)}
  }

  async signOut():Promise<void>{if(this.auth){const{signOut}=await import('firebase/auth');await signOut(this.auth)}this.user.set(null);this.profile.set(null)}

  async changeOwnPin(currentPin:string,newPin:string):Promise<void>{
    if(!/^\d{6}$/.test(currentPin)||!/^\d{6}$/.test(newPin))throw new Error('Both PINs must contain exactly six digits.');
    if(currentPin===newPin)throw new Error('Choose a different new PIN.');
    await this.ensureInitialized();const user=this.user();if(!user?.email)throw new Error('Please sign in again.');
    try{const{EmailAuthProvider,reauthenticateWithCredential,updatePassword}=await import('firebase/auth');await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,currentPin));await updatePassword(user,newPin)}catch(error){const code=typeof error==='object'&&error&&'code'in error?String((error as{code:unknown}).code):'';if(code.includes('invalid-credential')||code.includes('wrong-password'))throw new Error('The current PIN is incorrect.');if(code.includes('too-many-requests'))throw new Error('Too many attempts. Please wait and try again.');throw error instanceof Error?error:new Error('Unable to change the PIN.')}
  }

  private async initialize():Promise<void>{
    try{
      const[{getApps,initializeApp},{getAuth,onAuthStateChanged},{getFirestore}]=await Promise.all([import('firebase/app'),import('firebase/auth'),import('firebase/firestore')]);
      const app=getApps()[0]??initializeApp(firebaseConfig);this.auth=getAuth(app);this.firestore=getFirestore(app);
      onAuthStateChanged(this.auth,async user=>{try{await this.applyUser(user)}catch(error){this.error.set(this.friendlyError(error));this.user.set(null);this.profile.set(null)}finally{this.loading.set(false);this.readyResolver()}});
    }catch(error){this.error.set(this.friendlyError(error));this.loading.set(false);this.readyResolver()}
  }

  private async ensureInitialized():Promise<void>{await this.whenReady();if(!this.auth||!this.firestore)throw new Error('Firebase Authentication is not configured.')}

  private async applyUser(user:User|null):Promise<void>{
    this.user.set(user);this.profile.set(null);if(!user||!this.firestore)return;
    const{doc,getDoc}=await import('firebase/firestore');const snapshot=await getDoc(doc(this.firestore,'users',user.uid));
    if(!snapshot.exists()){this.error.set('Your account has no application profile.');return}
    const data=snapshot.data();const role=data['role']==='head'?'head':data['role']==='controller'?'controller':'worker';
    const profile:UserProfile={uid:user.uid,email:user.email??'',displayName:String(data['displayName']??user.email??'User'),role,active:data['active']!==false};
    this.profile.set(profile);this.state.setMode(role);if(profile.active)await this.masterData.load();
  }

  private friendlyError(error:unknown):string{
    const code=typeof error==='object'&&error&&'code'in error?String((error as{code:unknown}).code):'';
    if(code.includes('invalid-credential')||code.includes('wrong-password')||code.includes('user-not-found'))return'Incorrect name or PIN.';
    if(code.includes('too-many-requests'))return'Too many attempts. Please wait and try again.';
    if(code.includes('network-request-failed'))return'Cannot reach Firebase. Check your internet connection.';
    return error instanceof Error?error.message:'Authentication failed.';
  }
}
