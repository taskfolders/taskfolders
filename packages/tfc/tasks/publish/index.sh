set -ex
npm version patch
npm publish --access public
npm publish --access public --ignore-scripts --@taskfolders:registry='https://registry.npmjs.org'
