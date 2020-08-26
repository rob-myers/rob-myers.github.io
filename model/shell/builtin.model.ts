export enum BuiltinOtherType {
  cd= 'cd',
  declare= 'declare',
  echo= 'echo',
  false= 'false',
  history= 'history',
  kill= 'kill',
  /** See LetComposite */
  let= 'let',
  local= 'local',
  logout= 'logout',
  printf= 'printf',
  pwd= 'pwd',
  read= 'read',
  /** Same as '.' */
  source= 'source',
  /** Similar to `test`; actual command is [. */
  squareBracket= 'squareBracket',
  test= 'test',
  true= 'true',
  type= 'type',
  /** Same as {declare}. */
  typeset= 'typeset',
}