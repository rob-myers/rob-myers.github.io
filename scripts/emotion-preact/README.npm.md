```sh
# To login to npm
# https://docs.npmjs.com/cli/v7/commands/npm-adduser
npm adduser

# To find e.g. location of tarball
npm view @rob-myers/alias
npm view @emotion/react
npm view @emotion/react dist.tarball

# To publish
cd scripts/package
npm publish --access public

# To unpublish all versions
cd scripts/package
npm unpublish @rob-myers/package
```
