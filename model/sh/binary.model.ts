import { keys } from '@model/generic.model';
import { BuiltinBinaryType } from './builtin.model';

/**
 * Possible values of {BinaryComposite.binaryKey}.
 */
export type BinaryType = BinaryExecType | BinaryGuiType | BuiltinBinaryType;

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

/**
 * Binaries with a UI.
 */
export enum BinaryGuiType {
  /** Stage to display topdown game  */
  stage= 'stage',
  /** Live process information. */
  top= 'top',
}

export const isBinaryUiType = (key: string): key is BinaryGuiType => key in BinaryGuiType;
export const binaryGuiTypes = keys(BinaryGuiType) as BinaryGuiType[];

export interface BaseGuiSpec {
  guiKey: BinaryGuiType;
}

export const isBinaryType = (x: string): x is BinaryType => isBinaryExecType(x) || isBinaryUiType(x);
