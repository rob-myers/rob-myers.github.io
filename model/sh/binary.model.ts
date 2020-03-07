import { keys } from '@model/generic.model';
import { BuiltinBinaryType } from './builtin.model';

/**
 * Possible values of {BinaryComposite.binaryKey}.
 */
export type BinaryType = BinaryExecType | BuiltinBinaryType;

/**
 * Exectuable binaries.
 */
export enum BinaryExecType {
  bash= 'bash',
  cat= 'cat',
  clear= 'clear',
  cp= 'cp',
  // curl= 'curl',
  date= 'date',
  grep= 'grep',
  head= 'head',
  ls= 'ls',
  mkdir= 'mkdir',
  mv= 'mv',
  realpath= 'realpath',
  rm= 'rm',
  rmdir= 'rmdir',
  sleep= 'sleep',
  say= 'say',
  seq= 'seq',
  tail= 'tail',
  tty= 'tty',
  wc= 'wc',
}

export const isBinaryExecType = (key: string): key is BinaryExecType => key in BinaryExecType;
export const binaryExecTypes = keys(BinaryExecType) as BinaryExecType[];

export const isBinaryType = (x: string): x is BinaryType => isBinaryExecType(x);
