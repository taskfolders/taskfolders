set -ex
npm version patch
npm publish --public
npm publish --access public --ignore-scripts --@taskfolders:registry='https://registry.npmjs.org'
