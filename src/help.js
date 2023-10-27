import chalk from 'chalk';

const usage = `
npm run <command> included in ${ chalk.bold( process.env.npm_package_name ) }:

Usage:

npm run ${ chalk.bold( 'help' ) }\t\t\t\t\t- this usage page
npm run ${ chalk.bold( 'dev -- --port {port} --file_peer_id {file_peer_id} --file_swarm_key {file_swarm_key}' ) }\t\t\t- run the program in development mode
npm run ${ chalk.bold( 'start -- --port {port} --file_peer_id {file_peer_id} --file_swarm_key {file_swarm_key}' ) }\t\t\t- run the program in production mode

`

console.log( '%s', usage );
