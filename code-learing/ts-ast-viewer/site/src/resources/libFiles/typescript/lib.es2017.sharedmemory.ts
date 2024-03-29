const fileData = {
    fileName: `/lib.es2017.sharedmemory.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: "/// <reference no-default-lib=\"true\"/>\n/// <reference lib=\"es2015.symbol\" />\n/// <reference lib=\"es2015.symbol.wellknown\" />\ninterface SharedArrayBuffer{readonly byteLength:number;slice(begin:number,end?:number):SharedArrayBuffer;readonly[Symbol.species]:SharedArrayBuffer;readonly[Symbol.toStringTag]:\"SharedArrayBuffer\";}interface SharedArrayBufferConstructor{readonly prototype:SharedArrayBuffer;new(byteLength:number):SharedArrayBuffer;}declare var SharedArrayBuffer:SharedArrayBufferConstructor;interface ArrayBufferTypes{SharedArrayBuffer:SharedArrayBuffer;}interface Atomics{add(typedArray:Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array,index:number,value:number):number;and(typedArray:Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array,index:number,value:number):number;compareExchange(typedArray:Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array,index:number,expectedValue:number,replacementValue:number):number;exchange(typedArray:Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array,index:number,value:number):number;isLockFree(size:number):boolean;load(typedArray:Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array,index:number):number;or(typedArray:Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array,index:number,value:number):number;store(typedArray:Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array,index:number,value:number):number;sub(typedArray:Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array,index:number,value:number):number;wait(typedArray:Int32Array,index:number,value:number,timeout?:number):\"ok\"|\"not-equal\"|\"timed-out\";notify(typedArray:Int32Array,index:number,count?:number):number;xor(typedArray:Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array,index:number,value:number):number;readonly[Symbol.toStringTag]:\"Atomics\";}declare var Atomics:Atomics;"
};

export default fileData;