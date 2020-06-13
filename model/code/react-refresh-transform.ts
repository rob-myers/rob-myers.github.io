/**
 * This is https://github.com/facebook/react/blob/master/packages/react-refresh/src/ReactFreshBabelPlugin.js
 * rewritten using typescript, and no longer a babel plugin.
 */
/* eslint-disable @typescript-eslint/indent */
import * as babel from '@babel/core';
import { types as t } from '@babel/core';
import generate from '@babel/generator';

import { exampleTsx1, exampleTsx2, exampleTsx3 } from './examples';

interface Options {
  refreshReg?: string;
  refreshSig?: string;
  emitFullSignatures?: boolean;
}
interface Registration {
  handle: t.Identifier;
  persistentID: string;
}
type BuiltinHookName = (
  | 'useState' | 'React.useState'
  | 'useReducer' | 'React.useReducer'
  | 'useEffect' | 'React.useEffect'
  | 'useLayoutEffect' | 'React.useLayoutEffect'
  | 'useMemo' | 'React.useMemo'
  | 'useCallback' | 'React.useCallback'
  | 'useRef' | 'React.useRef'
  | 'useContext' | 'React.useContext'
  | 'useImperativeMethods' | 'React.useImperativeMethods'
  | 'useDebugValue' | 'React.useDebugValue'
);

interface HookCall {
  key: string;
  callee: t.CallExpression['callee'];
  name: string;
}

interface Signature {
 key: string;
 customHooks: HookCall['callee'][];
}

// type Visitor = Parameters<typeof babel.traverse>[1];
type Visitor = Parameters<babel.NodePath['traverse']>[0];

type SansV8<T> = Exclude<T, t.V8IntrinsicIdentifier>;

/**
 * There should be a single instance of this class.
 */
class Transform {

  private refreshReg: t.Identifier;
  private refreshSig: t.Identifier;
  private registrationsByProgramPath = new Map<babel.NodePath, Registration[]>();

  private seenForRegistration = new WeakSet();
  private seenForSignature = new WeakSet();
  private seenForOutro = new WeakSet();
  private hookCalls = new WeakMap<t.Function, HookCall[]>();
  private hasForceResetCommentByFile = new WeakMap<any, boolean>();
  private hooksCallsVisitor!: Visitor;
  private visitor!: Visitor;
  
  constructor(private opts: Options = {}) {
    this.refreshReg = t.identifier(opts.refreshReg || '$RefreshReg$');
    this.refreshSig = t.identifier(opts.refreshSig || '$RefreshSig$');
    if (typeof opts.emitFullSignatures === 'undefined') {
      this.opts.emitFullSignatures = true;
    }
  }
  
  public run(code: string, filename: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parsed = babel.parseSync(code, {
      filename,
      plugins: [
        ['@babel/plugin-transform-typescript', { isTSX: true }],
      ],
    })!;
    // console.log({ code: generate(parsed!) });

    babel.traverse(parsed!, this.visitor);
    console.log({ code: generate(parsed!) });
  }

  public setupVisitors() {
    this.hooksCallsVisitor = {
      CallExpression: (path) => {
        const node = path.node;
        const callee = node.callee;
    
        // Note: this visitor MUST NOT mutate the tree in any way.
        // It runs early in a separate traversal and should be very fast.
        let name = null;
        switch (callee.type) {
          case 'Identifier':
            name = callee.name;
            break;
          case 'MemberExpression':
            name = callee.property.name;
            break;
        }
        if (name === null || !/^use[A-Z]/.test(name)) {
          return;
        }
        const fnScope = path.scope.getFunctionParent();
        if (fnScope === null) {
          return;
        }
    
        // This is a Hook call. Record it.
        const fnNode = fnScope.block as t.Function; // Type correct?
        if (!this.hookCalls.has(fnNode)) {
          this.hookCalls.set(fnNode, []);
        }
        const hookCallsForFn = this.hookCalls.get(fnNode)!;
        let key = '';
        if (path.parent.type === 'VariableDeclarator') {
          // TODO: if there is no LHS, consider some other heuristic.
          key = (path.parentPath.get('id') as babel.NodePath).getSource();
        }
    
        // Some built-in Hooks reset on edits to arguments.
        const args = path.get('arguments');
        if (name === 'useState' && args.length > 0) {
          // useState second argument is initial state.
          key += '(' + args[0].getSource() + ')';
        } else if (name === 'useReducer' && args.length > 1) {
          // useReducer second argument is initial state.
          key += '(' + args[1].getSource() + ')';
        }
    
        hookCallsForFn.push({
          callee: path.node.callee,
          name,
          key,
        });
      }
    };

    /** FunctionExpression or ArrowFunctionExpression */
    const functionExpr: Visitor['ArrowFunctionExpression'] = {
      exit: (path) => {
        const node = path.node;
        const signature = this.getHookCallsSignature(node);
        if (signature === null) {
          return;
        }

        // Make sure we're not mutating the same tree twice.
        // This can happen if another Babel plugin replaces parents.
        if (this.seenForSignature.has(node)) {
          return;
        }
        this.seenForSignature.add(node);
        // Don't mutate the tree above this point.

        const sigCallID = path.scope.generateUidIdentifier('_s');
        path.scope.parent.push({
          id: sigCallID,
          init: t.callExpression(this.refreshSig, []),
        });

        // The signature call is split in two parts. One part is called inside the function.
        // This is used to signal when first render happens.
        if (path.node.body.type !== 'BlockStatement') {// ArrowFunctionExpression only
          path.node.body = t.blockStatement([
            t.returnStatement(path.node.body),
          ]);
        }
        path
          .get('body')
          .unshiftContainer(
            'body',
            t.expressionStatement(t.callExpression(sigCallID, [])),
          );

        // The second call is around the function itself.
        // This is used to associate a type with a signature.

        if (path.parent.type === 'VariableDeclarator') {
          let insertAfterPath = null as null | babel.NodePath;
          path.find(p => {
            if (p.parentPath.isBlock()) {
              insertAfterPath = p;
              return true;
            }
            return false;
          });
          if (insertAfterPath === null) {
            return;
          }
          // Special case when a function would get an inferred name:
          // let Foo = () => {}
          // let Foo = function() {}
          // We'll add signature it on next line so that
          // we don't mess up the inferred 'Foo' function name.
          insertAfterPath.insertAfter(
            t.expressionStatement(
              t.callExpression(
                sigCallID,
                this.createArgumentsForSignature(
                  path.parent.id,
                  signature,
                  insertAfterPath.scope,
                ) as SansV8<t.Expression>[],
              ),
            ),
          );
          // Result: let Foo = () => {}; __signature(Foo, ...);
        } else {
          // let Foo = hoc(() => {})
          path.replaceWith(
            t.callExpression(
              sigCallID,
              this.createArgumentsForSignature(node, signature, path.scope) as SansV8<t.Expression>[],
            ),
          );
          // Result: let Foo = hoc(__signature(() => {}, ...))
        }
      },
    };

    this.visitor = {
      ExportDefaultDeclaration: (path) => {
        const node = path.node;
        const decl = node.declaration;
        const declPath = path.get('declaration');
        if (decl.type !== 'CallExpression') {
          // For now, we only support possible HOC calls here.
          // Named function declarations are handled in FunctionDeclaration.
          // Anonymous direct exports like export default function() {}
          // are currently ignored.
          return;
        }

        // Make sure we're not mutating the same tree twice.
        // This can happen if another Babel plugin replaces parents.
        if (this.seenForRegistration.has(node)) {
          return;
        }
        this.seenForRegistration.add(node);
        // Don't mutate the tree above this point.

        // This code path handles nested cases like:
        // export default memo(() => {})
        // In those cases it is more plausible people will omit names
        // so they're worth handling despite possible false positives.
        // More importantly, it handles the named case:
        // export default memo(function Named() {})
        const inferredName = '%default%';
        const programPath = path.parentPath;
        this.findInnerComponents(
          inferredName,
          declPath,
          (persistentID, targetExpr, targetPath) => {
            if (targetPath === null) {
              // For case like:
              // export default hoc(Foo)
              // we don't want to wrap Foo inside the call.
              // Instead we assume it's registered at definition.
              return;
            }
            const handle = this.createRegistration(programPath, persistentID);
            targetPath.replaceWith(
              t.assignmentExpression('=', handle, targetExpr as SansV8<t.Expression>),
            );
          },
        );
      },
      FunctionDeclaration: {
        enter: (path) => {
          const node = path.node;
          let programPath: babel.NodePath;
          let insertAfterPath: babel.NodePath;
          switch (path.parent.type) {
            case 'Program':
              insertAfterPath = path;
              programPath = path.parentPath;
              break;
            case 'ExportNamedDeclaration':
              insertAfterPath = path.parentPath;
              programPath = insertAfterPath.parentPath;
              break;
            case 'ExportDefaultDeclaration':
              insertAfterPath = path.parentPath;
              programPath = insertAfterPath.parentPath;
              break;
            default:
              return;
          }
          const id = node.id;
          if (id === null) {
            // We don't currently handle anonymous default exports.
            return;
          }
          const inferredName = id.name;
          if (!this.isComponentishName(inferredName)) {
            return;
          }

          // Make sure we're not mutating the same tree twice.
          // This can happen if another Babel plugin replaces parents.
          if (this.seenForRegistration.has(node)) {
            return;
          }
          this.seenForRegistration.add(node);
          // Don't mutate the tree above this point.

          // export function Named() {}
          // function Named() {}
          this.findInnerComponents(
            inferredName,
            path,
            (persistentID, targetExpr) => {
              const handle = this.createRegistration(programPath, persistentID);
              insertAfterPath.insertAfter(
                t.expressionStatement(
                  t.assignmentExpression('=', handle, targetExpr as SansV8<t.Expression>),
                ),
              );
            },
          );
        },
        exit: (path) => {
          const node = path.node;
          const id = node.id;
          if (id === null) {
            return;
          }
          const signature = this.getHookCallsSignature(node);
          if (signature === null) {
            return;
          }

          // Make sure we're not mutating the same tree twice.
          // This can happen if another Babel plugin replaces parents.
          if (this.seenForSignature.has(node)) {
            return;
          }
          this.seenForSignature.add(node);
          // Don't mutate the tree above this point.

          const sigCallID = path.scope.generateUidIdentifier('_s');
          path.scope.parent.push({
            id: sigCallID,
            init: t.callExpression(this.refreshSig, []),
          });

          // The signature call is split in two parts. One part is called inside the function.
          // This is used to signal when first render happens.
          path
            .get('body')
            .unshiftContainer(
              'body',
              t.expressionStatement(t.callExpression(sigCallID, [])),
            );

          // The second call is around the function itself.
          // This is used to associate a type with a signature.

          // Unlike with $RefreshReg$, this needs to work for nested
          // declarations too. So we need to search for a path where
          // we can insert a statement rather than hardcoding it.
          let insertAfterPath = null as null | babel.NodePath;
          path.find(p => {
            if (p.parentPath.isBlock()) {
              insertAfterPath = p;
              return true;
            }
            return false;
          });
          if (insertAfterPath === null) {
            return;
          }

          insertAfterPath.insertAfter(
            t.expressionStatement(
              t.callExpression(
                sigCallID,
                this.createArgumentsForSignature(
                  id,
                  signature,
                  insertAfterPath.scope,
                ) as SansV8<t.Expression>[],
              ),
            ),
          );
        },
      },
      ArrowFunctionExpression: functionExpr,
      FunctionExpression: functionExpr as Visitor['FunctionExpression'],
      VariableDeclaration: (path) => {
        const node = path.node;
        let programPath: babel.NodePath;
        let insertAfterPath: babel.NodePath;
        switch (path.parent.type) {
          case 'Program':
            insertAfterPath = path;
            programPath = path.parentPath;
            break;
          case 'ExportNamedDeclaration':
            insertAfterPath = path.parentPath;
            programPath = insertAfterPath.parentPath;
            break;
          case 'ExportDefaultDeclaration':
            insertAfterPath = path.parentPath;
            programPath = insertAfterPath.parentPath;
            break;
          default:
            return;
        }

        // Make sure we're not mutating the same tree twice.
        // This can happen if another Babel plugin replaces parents.
        if (this.seenForRegistration.has(node)) {
          return;
        }
        this.seenForRegistration.add(node);
        // Don't mutate the tree above this point.

        const declPaths = path.get('declarations');
        if (declPaths.length !== 1) {
          return;
        }
        const declPath = declPaths[0];
        const inferredName = (declPath.node.id as t.Identifier).name;
        this.findInnerComponents(
          inferredName,
          declPath,
          (persistentID, targetExpr, targetPath) => {
            if (targetPath === null) {
              // For case like:
              // export const Something = hoc(Foo)
              // we don't want to wrap Foo inside the call.
              // Instead we assume it's registered at definition.
              return;
            }
            const handle = this.createRegistration(programPath, persistentID);
            if (targetPath.parent.type === 'VariableDeclarator') {
              // Special case when a variable would get an inferred name:
              // let Foo = () => {}
              // let Foo = function() {}
              // let Foo = styled.div``;
              // We'll register it on next line so that
              // we don't mess up the inferred 'Foo' function name.
              // (eg: with @babel/plugin-transform-react-display-name or
              // babel-plugin-styled-components)
              insertAfterPath.insertAfter(
                t.expressionStatement(
                  t.assignmentExpression('=', handle, declPath.node.id as t.Identifier),
                ),
              );
              // Result: let Foo = () => {}; _c1 = Foo;
            } else {
              // let Foo = hoc(() => {})
              targetPath.replaceWith(
                t.assignmentExpression('=', handle, targetExpr as SansV8<t.Expression>),
              );
              // Result: let Foo = hoc(_c1 = () => {})
            }
          },
        );
      },
      Program: {
        enter: (path) => {
          // This is a separate early visitor because we need to collect Hook calls
          // and "const [foo, setFoo] = ..." signatures before the destructuring
          // transform mangles them. This extra traversal is not ideal for perf,
          // but it's the best we can do until we stop transpiling destructuring.
          path.traverse(this.hooksCallsVisitor);
        },
        exit: (path) => {
          const registrations = this.registrationsByProgramPath.get(path);
          if (registrations === undefined) {
            return;
          }

          // Make sure we're not mutating the same tree twice.
          // This can happen if another Babel plugin replaces parents.
          const node = path.node;
          if (this.seenForOutro.has(node)) {
            return;
          }
          this.seenForOutro.add(node);
          // Don't mutate the tree above this point.

          this.registrationsByProgramPath.delete(path);
          const declarators = [] as t.VariableDeclarator[];
          path.pushContainer('body', t.variableDeclaration('var', declarators));
          registrations.forEach(({handle, persistentID}) => {
            path.pushContainer(
              'body',
              t.expressionStatement(
                t.callExpression(this.refreshReg, [
                  handle,
                  t.stringLiteral(persistentID),
                ]),
              ),
            );
            declarators.push(t.variableDeclarator(handle));
          });
        },
      },
    };
  }

  private createRegistration(programPath: babel.NodePath, persistentID: string) {
    const handle = programPath.scope.generateUidIdentifier('c');
    if (!this.registrationsByProgramPath.has(programPath)) {
      this.registrationsByProgramPath.set(programPath, []);
    }
    const registrations = this.registrationsByProgramPath.get(programPath)!;
    registrations.push({ handle, persistentID });
    return handle;
  }

  private isComponentishName(name: string) {
    return typeof name === 'string' && name[0] >= 'A' && name[0] <= 'Z';
  }

  private findInnerComponents(
    inferredName: string,
    path: babel.NodePath,
    callback: (name: string, node: babel.Node | null, path: babel.NodePath | null) => void,
  ) {
    const node = path.node;
    switch (node.type) {
      case 'Identifier': {
        if (!this.isComponentishName(node.name)) {
          return false;
        }
        // export default hoc(Foo)
        // const X = hoc(Foo)
        callback(inferredName, node, null);
        return true;
      }
      case 'FunctionDeclaration': {
        // function Foo() {}
        // export function Foo() {}
        // export default function Foo() {}
        callback(inferredName, node.id, null);
        return true;
      }
      case 'ArrowFunctionExpression': {
        if (node.body.type === 'ArrowFunctionExpression') {
          return false;
        }
        // let Foo = () => {}
        // export default hoc1(hoc2(() => {}))
        callback(inferredName, node, path);
        return true;
      }
      case 'FunctionExpression': {
        // let Foo = function() {}
        // const Foo = hoc1(forwardRef(function renderFoo() {}))
        // export default memo(function() {})
        callback(inferredName, node, path);
        return true;
      }
      case 'CallExpression': {
        const argsPath = path.get('arguments');
        if (Array.isArray(argsPath) && argsPath.length === 0) {
          return false;
        }
        const calleePath = path.get('callee') as babel.NodePath;
        switch (calleePath.node.type) {
          case 'MemberExpression':
          case 'Identifier': {
            const calleeSource = calleePath.getSource();
            const firstArgPath = (argsPath as babel.NodePath[])[0];
            const innerName = inferredName + '$' + calleeSource;
            const foundInside = this.findInnerComponents(
              innerName,
              firstArgPath,
              callback,
            );
            if (!foundInside) {
              return false;
            }
            // const Foo = hoc1(hoc2(() => {}))
            // export default memo(React.forwardRef(function() {}))
            callback(inferredName, node, path);
            return true;
          }
          default: {
            return false;
          }
        }
      }
      case 'VariableDeclarator': {
        const init = node.init;
        if (init === null) {
          return false;
        }
        const name = (node.id as t.Identifier).name;
        if (!this.isComponentishName(name)) {
          return false;
        }
        switch (init.type) {
          case 'ArrowFunctionExpression':
          case 'FunctionExpression':
            // Likely component definitions.
            break;
          case 'CallExpression': {
            // Maybe a HOC.
            // Try to determine if this is some form of import.
            const callee = init.callee;
            switch (callee.type) {
              case 'Import':
                  return false;
              case 'Identifier': {
                if (callee.name.indexOf('require') === 0) {
                  return false;
                } else if (callee.name.indexOf('import') === 0) {
                  return false;
                }
                // Neither require nor import. Might be a HOC.
                // Pass through.
                break;
              }
              case 'MemberExpression': {
                // Could be something like React.forwardRef(...)
                // Pass through.
                break;
              }
              default: {
                // More complicated call.
                return false;
              }
            }
            break;
          }
          case 'TaggedTemplateExpression':
            // Maybe something like styled.div`...`
            break;
          default:
            return false;
        }
        const initPath = path.get('init') as babel.NodePath;
        const foundInside = this.findInnerComponents(
          inferredName,
          initPath,
          callback,
        );
        if (foundInside) {
          return true;
        }
        // See if this identifier is used in JSX. Then it's a component.
        const binding = path.scope.getBinding(name);
        if (binding === undefined) {
          return;
        }
        let isLikelyUsedAsType = false;
        const referencePaths = binding.referencePaths;
        for (let i = 0; i < referencePaths.length; i++) {
          const ref = referencePaths[i];
          if (
            ref.node &&
            ref.node.type !== 'JSXIdentifier' &&
            ref.node.type !== 'Identifier'
          ) {
            continue;
          }
          const refParent = ref.parent;
          if (refParent.type === 'JSXOpeningElement') {
            isLikelyUsedAsType = true;
          } else if (refParent.type === 'CallExpression') {
            const callee = refParent.callee;
            let fnName;
            switch (callee.type) {
              case 'Identifier':
                fnName = callee.name;
                break;
              case 'MemberExpression':
                fnName = callee.property.name;
                break;
            }
            switch (fnName) {
              case 'createElement':
              case 'jsx':
              case 'jsxDEV':
              case 'jsxs':
                isLikelyUsedAsType = true;
                break;
            }
          }
          if (isLikelyUsedAsType) {
            // const X = ... + later <X />
            callback(inferredName, init, initPath);
            return true;
          }
        }
      }
    }
    return false;
  }

  private isBuiltinHook(hookName: string): hookName is BuiltinHookName {
    switch (hookName) {
      case 'useState':
      case 'React.useState':
      case 'useReducer':
      case 'React.useReducer':
      case 'useEffect':
      case 'React.useEffect':
      case 'useLayoutEffect':
      case 'React.useLayoutEffect':
      case 'useMemo':
      case 'React.useMemo':
      case 'useCallback':
      case 'React.useCallback':
      case 'useRef':
      case 'React.useRef':
      case 'useContext':
      case 'React.useContext':
      case 'useImperativeMethods':
      case 'React.useImperativeMethods':
      case 'useDebugValue':
      case 'React.useDebugValue':
        return true;
      default:
        return false;
    }
  }

  private getHookCallsSignature(functionNode: t.Function): null | Signature {
    const fnHookCalls = this.hookCalls.get(functionNode);
    if (fnHookCalls === undefined) {
      return null;
    }
    return {
      key: fnHookCalls.map(call => call.name + '{' + call.key + '}').join('\n'),
      customHooks: fnHookCalls
        .filter(call => !this.isBuiltinHook(call.name))
        .map(call => t.cloneDeep(call.callee)),
    };
  }

  // We let user do /* @refresh reset */ to reset state in the whole file.
  private hasForceResetComment(path: babel.NodePath) {
    const file = path.hub.file;
    let hasForceReset = this.hasForceResetCommentByFile.get(file);
    if (hasForceReset !== undefined) {
      return hasForceReset;
    }

    hasForceReset = false;
    const comments = file.ast.comments;
    for (let i = 0; i < comments.length; i++) {
      const cmt = comments[i];
      if (cmt.value.indexOf('@refresh reset') !== -1) {
        hasForceReset = true;
        break;
      }
    }

    this.hasForceResetCommentByFile.set(file, hasForceReset);
    return hasForceReset;
  }

  private createArgumentsForSignature(
    node: t.Node,
    signature: Signature,
    scope: babel.NodePath['scope'],
  ) {
    const {key, customHooks} = signature;
  
    let forceReset = this.hasForceResetComment(scope.path);
    const customHooksInScope = [] as HookCall['callee'][];
    customHooks.forEach(callee => {
      // Check if a corresponding binding exists where we emit the signature.
      let bindingName;
      switch (callee.type) {
        case 'MemberExpression':
          if (callee.object.type === 'Identifier') {
            bindingName = callee.object.name;
          }
          break;
        case 'Identifier':
          bindingName = callee.name;
          break;
      }
      if (scope.hasBinding(bindingName)) {
        customHooksInScope.push(callee);
      } else {
        // We don't have anything to put in the array because Hook is out of scope.
        // Since it could potentially have been edited, remount the component.
        forceReset = true;
      }
    });
  
    let finalKey = key;
    if (typeof require === 'function' && !this.opts.emitFullSignatures) {
      // Prefer to hash when we can (e.g. outside of ASTExplorer).
      // This makes it deterministically compact, even if there's
      // e.g. a useState ininitalizer with some code inside.
      // We also need it for www that has transforms like cx()
      // that don't understand if something is part of a string.
      finalKey = require('spark-md5').hash(key);
    }
  
    const args = [node, t.stringLiteral(finalKey)];
    if (forceReset || customHooksInScope.length > 0) {
      args.push(t.booleanLiteral(forceReset));
    }
    if (customHooksInScope.length > 0) {
      args.push(
        // TODO: We could use an arrow here to be more compact.
        // However, don't do it until AMA can run them natively.
        t.functionExpression(
          null,
          [],
          t.blockStatement([
            t.returnStatement(t.arrayExpression(
              customHooksInScope as SansV8<t.CallExpression['callee']>[]
            )),
          ]),
        ),
      );
    }
    return args;
  }
}

const singleton = new Transform();
singleton.setupVisitors();
export default singleton;

// Test
// singleton.run(exampleTsx1, 'fake.tsx');
// singleton.run(exampleTsx2, 'fake.tsx');
singleton.run(exampleTsx3, 'fake.tsx');
