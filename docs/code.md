## Dynamic inline script using `src`

```ts
blob = new Blob([
  'console.log("foo");'
], { type: 'text/javascript' });
s = document.createElement('script');
s.src = URL.createObjectURL(blob);
document.body.appendChild(s);
// foo
```

## Dynamic javascript modules

```ts
blob1 = new Blob([
  'export const foo = "intruder alert"'
], { type: 'text/javascript' })
s1 = document.createElement('script')
s1.setAttribute('type', 'module')
s1.src = URL.createObjectURL(blob1)
document.body.appendChild(s1)

blob2 = new Blob([
  `import { foo } from '${s1.src}';`,
  `console.log({ foo })`,
], { type: 'text/javascript' })
s2 = document.createElement('script')
s2.setAttribute('type', 'module')
s2.src = URL.createObjectURL(blob2)
document.body.appendChild(s2)
```

Can garbage collect via `URL.revokeObjectURL()`.