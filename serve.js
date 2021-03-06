/*
 * Copyright 2018 DoubleDutch, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const config = require('./config')
const { fileExists } = require('./utils')
const packager = require('./packager')

module.exports = function serveMobile(cmd, options) {
  if (!fileExists('package.json')) return console.log('This does not appear to be a doubledutch extension project. No package.json found.')
  const extensionPackageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  if (!extensionPackageJSON.doubledutch) return console.log('This does not appear to be the root folder of a DoubleDutch extension project. package.json does not have a doubledutch section.')

  return serve(cmd)
    .catch(err => console.error(err))
}

async function serve(cmd) {
  try {
    if (fs.existsSync('mobile')) {
      // Serve with the metro bundler: https://github.com/facebook/metro
      const root = path.join(process.cwd(), 'mobile')
      const port = 8081
      const createMiddleware = (platform, useManifest) => packager.createConnectMiddleware({
        baseManifestFilename: useManifest
          ? path.join(__dirname, 'bundles', config.baseBundleVersion, `base.${platform}.${config.baseBundleVersion}.manifest`)
          : null,
        root,
        port
      })

      const iosMiddleware = await createMiddleware('ios', false)
      const androidMiddleware = await createMiddleware('android', false)

      const connect = require('connect')
      const http = require('http')
      const server = connect()
        .use('/ios', iosMiddleware.middleware)
        .use('/android', androidMiddleware.middleware)
      server.listen(port)
    } else {
      console.log(chalk.yellow('mobile folder not found.'))
    }
  } catch (err) {
    console.log(typeof err === 'string' ? chalk.red(err) : err)
    process.exit(-1)
  }
}
