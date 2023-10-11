import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, zip } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedServiceService {
  private valuesSource = new BehaviorSubject<{
    portCode: string;
    containerType: string;
    containerSize: string;
  }>({
    portCode: '',
    containerType: '',
    containerSize: '',
  });
  private valuesforis = new BehaviorSubject<{
    portCode: string;
    containerType: string;
    containerSize: number;
    latitude:number;
    longitude:number;
  }>({
    portCode: '',
    containerType: '',
    containerSize: 0,
    latitude:0,
    longitude:0
  });
 
  values$ = this.valuesSource.asObservable();
  valuesforis$ = this.valuesforis.asObservable();
  
  private registeredEmailSource = new BehaviorSubject<string>('');
 
  registeredEmail$ = this.registeredEmailSource.asObservable();
  
 

  setRegisteredEmail(email: string) {
    this.registeredEmailSource.next(email);
    console.log("the email in shared service is"+email)
  }

 

  
setValues(values: {
  portCode: string;
  containerType: string;
  containerSize: string;
}) {
  this.valuesSource.next(values);
}
setisvalues(valuesforis:{
  portCode: string;
    containerType: string;
    containerSize: number;
    latitude:number;
    longitude:number;
}){
  this.valuesforis.next(valuesforis);
}

}