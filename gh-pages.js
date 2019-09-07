const ghpages = require('gh-pages');

/**
 * This task pushes to the `master` branch of the configured `repo`.
 */
(async () => {
  console.log(`Pushing the top-level directory "out" to master branch for GitHub Pages...`);

  try {
    await new Promise(
      resolve => {
        ghpages.publish('out', {
          branch: 'master',
          repo: 'git@github.com:rob-myers/rob-myers.github.io',
          user: {
            name: 'Robert S. R. Myers',
            email: 'me.robmyers@gmail.com'
          },
          /**
           * For .notjekyll, see:
           * https://github.com/zeit/next.js/wiki/Deploying-a-Next.js-app-into-GitHub-Pages.
           */
          dotfiles: true,
        },
          resolve
        );
      },
    );
    console.log("Finished.");

  } catch (e) {
    console.log(`Error: ${e}`);
    console.error(e);
  }


})()

