## Development

```sh
git clone git@github.com:rob-myers/rob-myers.github.io.git
cd rob-myers.github.io

nvm use
yarn
yarn dev
```

Open http://localhost:3001
> Port could be `3000` or as specified in [npm script dev](package.json)


## Local build

```sh
npm i -g http-server
yarn build && yarn export
cd out
http-server
```

## Deploy to production

```sh
yarn deploy
```