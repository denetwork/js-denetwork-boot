// Usage: $0 [--peerId <jsonFilePath>] [--listenMultiaddrs <ma> ... <ma>] [--announceMultiaddrs <ma> ... <ma>]
//           [--metricsPort <port>] [--disableMetrics] [--disablePubsubDiscovery]
//import minimist from 'minimist';
import { CommonUtil } from './utils/CommonUtil.js';
import { BootstrapNode } from './services/BootstrapNode.js';
import { PeerIdStorageService, SwarmKeyStorageService, SwarmKeyService, PeerIdService } from 'denetwork-lib';
import { LogUtil } from "denetwork-utils";
import { ParamUtils } from "./utils/ParamUtils.js";

import 'dotenv/config.js'
//const argv = minimist( process.argv.slice( 2 ) );

console.log( `main process.env`, process.env );

/**
 * 	command line args:
 * 	--p				: [required] e.g.: 9911
 *
 * 	--peerId			: specify a filename where the peerId data was stared
 * 	--swarmKey			: specify a filename where the swarmKey data was stared
 *
 * 	--disablePubsubDiscovery	: e.g.: false
 *		env.DISABLE_PUBSUB_DISCOVERY
 */
async function main()
{
	//
	//	get parameters
	//
	const argListenPort = ParamUtils.getPort( 8011 );
	const argListenAddress = ParamUtils.getParamStringValue( 'LISTEN_ADDRESS', undefined );
	const argAnnounceMultiaddrs = ParamUtils.getParamStringValue( 'ANNOUNCE_MULTIADDRS', undefined );
	const argFilePeerId = ParamUtils.getParamStringValue( 'FILE_PEER_ID', undefined );
	const argFileSwarmKey = ParamUtils.getParamStringValue( 'FILE_SWARM_KEY', undefined );

	console.log( `argListenPort : `, argListenPort );
	console.log( `argListenAddress : `, argListenAddress );

	//	...
	const peerIdObject = await preparePeerId( argFilePeerId );
	if ( null === peerIdObject )
	{
		LogUtil.say( `failed to create/load peerId. Create a new peerId using \`denetwork-lib\`` );
		return false;
	}

	//	...
	const swarmKey = await prepareSwarmKey( argFileSwarmKey );
	if ( null === swarmKey )
	{
		LogUtil.say( `invalid swarm key. Create a new swarm key using \`denetwork-lib\`` );
		return false;
	}

	//	multiaddrs
	const listenAddresses	= CommonUtil.getListenAddresses( argListenAddress, argListenPort );
	const announceAddresses	= CommonUtil.getAnnounceAddresses( argAnnounceMultiaddrs )

	LogUtil.say( `listenAddresses: ${ listenAddresses.map( ( a ) => a ) }` )
	announceAddresses.length && LogUtil.say( `announceAddresses: ${ announceAddresses.map( ( a ) => a ) }` )

	// //	Discovery
	// const pubsubDiscoveryEnabled = ! (
	// 	argv.disablePubsubDiscovery || process.env.DISABLE_PUBSUB_DISCOVERY
	// )

	//
	//	Create Node
	//
	const relay = await BootstrapNode.create( {
		peerId : peerIdObject,
		swarmKey : swarmKey,
		listenAddresses : listenAddresses,
		announceAddresses : announceAddresses
	} );
	await relay.start();
	LogUtil.say( 'DeNetwork Bootstrapper Server listening on:' );
	const multiaddrs = relay.getMultiaddrs();
	multiaddrs.forEach( ( ma ) => {
		LogUtil.say( `${ ma.toString() }` );
	} );

	const stop = async () =>
	{
		LogUtil.say( 'Stopping...' )
		await relay.stop()

		//metricsServer && await metricsServer.close()

		process.exit( 0 )
	}

	process.on( 'SIGTERM', stop )
	process.on( 'SIGINT', stop )
}

/**
 *	@param	filePeerId
 *	@returns {Promise<PeerId|null>}
 */
async function preparePeerId( filePeerId )
{
	const peerIdStorageService = new PeerIdStorageService();
	const filename = peerIdStorageService.getSafeFilename( filePeerId );
	let peerIdObject = null;
	try
	{
		peerIdObject = await PeerIdService.loadPeerId( filename );
	}
	catch ( err )
	{
		console.log( err )
		LogUtil.say( `failed to load peerId` );
	}

	if ( null === peerIdObject )
	{
		peerIdObject = await PeerIdService.flushPeerId( filename );
		LogUtil.say( `created a new peerId` );
	}

	const storagePeerId = peerIdStorageService.storagePeerIdFromRaw( peerIdObject );
	LogUtil.say( `peerId: ${ storagePeerId.id }, from: ${ filename }` );
	return peerIdObject;
}

/**
 *	@returns {Promise<Uint8Array|null>}
 */
async function prepareSwarmKey( fileSwarmKey )
{
	const swarmKeyStorageService = new SwarmKeyStorageService();
	const filename = swarmKeyStorageService.getSafeFilename( fileSwarmKey );
	let swarmKey	= null;
	let swarmKeyObject	= null;

	try
	{
		swarmKey = await SwarmKeyService.loadSwarmKey( filename );
		swarmKeyObject = swarmKeyStorageService.swarmKeyToObject( swarmKey );
		LogUtil.say( `swarm key: ${ swarmKeyObject.key }, from: ${ filename }` );
	}
	catch ( err )
	{
		console.log( err )
		LogUtil.say( `failed to load swarmKey` );
	}

	if ( ! swarmKeyStorageService.isValidSwarmKeyObject( swarmKeyObject ) )
	{
		return null;
	}

	return swarmKey;
}


main().then( () => {} );
