export function getModelFileExtension(name:string):string{const index=name.lastIndexOf(".");return index<0?"":name.slice(index+1).toLowerCase();}
