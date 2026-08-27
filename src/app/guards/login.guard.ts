import{inject}from'@angular/core';import{CanActivateFn,Router}from'@angular/router';import{AuthService}from'../services/auth.service';

export const loginGuard:CanActivateFn=async()=>{const auth=inject(AuthService);if(!auth.enabled)return inject(Router).createUrlTree(['/dashboard']);await auth.whenReady();return true};
