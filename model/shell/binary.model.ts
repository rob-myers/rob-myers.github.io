import { BuiltinOtherType } from "./builtin.model";

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
  expr= 'expr',
  grep= 'grep',
  head= 'head',
  ls= 'ls',
  mkdir= 'mkdir',
  mkfifo= 'mkfifo',
  mv= 'mv',
  ps= 'ps',
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

/**
 * Some builtins have binaries.
 */
export type BuiltinBinaryType = (
  | BuiltinOtherType.echo
  | BuiltinOtherType.pwd
  | '['
);
