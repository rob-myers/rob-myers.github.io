import path from 'path';
import ghpages from 'gh-pages';

const {
  GITHUB_BASE_PATH = '../out',
  GITHUB_BRANCH = 'master',
  GITHUB_REPO = 'git@github.com:rob-myers/rob-myers.github.io',
  GITHUB_USER = 'Robert S. R. Myers',
  GITHUB_EMAIL = 'me.robmyers@gmail.com',
} = process.env;

(async () => {
  console.log(`Pushing directory "${
    path.resolve(__dirname, GITHUB_BASE_PATH)
  }" to branch "${GITHUB_BRANCH}" (gh-pages)`);

  try {
    await new Promise(resolve => {
      ghpages.publish(
        GITHUB_BASE_PATH,
        {
          branch: GITHUB_BRANCH,
          repo: GITHUB_REPO,
          user: {
            name: GITHUB_USER,
            email: GITHUB_EMAIL,
          },
          dotfiles: true, // Ensure .notjekyll is pushed.
        },
        resolve
      );
    });
  } catch (e) {
    console.error(e);
  }
})();
