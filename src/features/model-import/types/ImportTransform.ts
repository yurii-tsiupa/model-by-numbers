export type Vector3Tuple=[number,number,number];
export type ImportTransform={rotation:Vector3Tuple;scale:number;centerOffset:Vector3Tuple};
export const DEFAULT_IMPORT_TRANSFORM:ImportTransform={rotation:[0,0,0],scale:1,centerOffset:[0,0,0]};
