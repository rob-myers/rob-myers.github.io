export enum UnaryTestType {
  '-e'= '-e',
  '-f'= '-f',
  '-d'= '-d',
  '-h'= '-h',
  '-p'= '-p',
  '-r'= '-r',
  '-w'= '-w',
  '-x'= '-x',
  '-O'= '-O',
  '-G'= '-G',

  '-t'= '-t',
  '-z'= '-z',
  '-n'= '-n',

  '!'='!',
}

export function isUnaryTest(x: string): x is UnaryTestType {
  return x in UnaryTestType;
}

export enum BinaryTestType {
  '-nt'= '-nt',
  '-ot'= '-ot',
  '-ef'= '-ef',

  '='= '=',
  '!='= '!=',
  '<'= '<',
  '>'= '>',

  '-eq'= '-eq',
  '-ne'= '-ne',
  '-lt'= '-lt',
  '-gt'= '-gt',
  '-le'= '-le',
  '-ge'= '-ge',
}

export function isBasicBinaryTest(x: string): x is BinaryTestType {
  return x in BinaryTestType;
}

export enum BinaryTestExtraType {
  '&&'= '&&',
  '||'= '||',
  '=='= '==',
  '=~'= '=~',
}

export function isExtraBinaryTest(x: string): x is BinaryTestExtraType {
  return x in BinaryTestType || x in BinaryTestExtraType;
}
