## Getting started

```sh
cd "${ROOT_DIR}"
npm init -y
yarn add react react-dom next

mkdir pages
yarn dev
```

```js
// in package.json
"scripts": {
  "dev": "next",
  "build": "next build",
  "start": "next start"
}
```

```tsx
// pages/index.tsx
const Index = () => (
  <div>
    <p>Hello Next.js!</p>
  </div>
)

export default Index;

// pages/about.tsx
export default function About() {
  return (
    <div>
      <p>This is the about page</p>
    </div>
  );
}
```

## Redux devtools for os webworker

`yarn dev` i.e. start the app.

`yarn os-remotedev` i.e. run a websocket server on `3002` ATOW.

Finally, in Redux DevTools extension:
   - click "Remote" to open new window.
   - click "Settings"
   - Use custom server, host: `localhost`, port: `3002` ATOW

## Bash examples

```sh
echo $'\033[31mHello\e[0m World'
echo $'\e[37mHello\e[0m World'

printf "\e[31mHello\e[0m World"
x=foo; printf "%s\e[37m%s\e[39m\n" "hello " "$x"
printf -v foo "\e[31mHello\e[0m World"; echo $foo

case "$x" in foo) echo foo; ;; bar) echo bar; esac
```

## Navigate between pages

```tsx
// pages/index.tsx
import Link from "next/link";
// ...
    <Link href="/about">
      <p>About</p>
    </Link>
```

## tsconfig.json setup

```sh
# stop server (Ctrl + C)
yarn add -D @types/react @types/node
yarn add -D typescript
yarn dev
# creates tsconfig.json
```

### aliases

```js
// tsconfig.json
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@components/*": ["./components/*"]
    }
```

```js
// next.config.ts
const path = require('path')

module.exports = {
  webpack(config, _options) {
    config.resolve.alias['@components'] = path.join(path.resolve(__dirname), 'components')
    return config
  },
}
```
