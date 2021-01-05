"use strict";
const caporal = require("caporal");
let cli = caporal;
const appletv_1 = require("../lib/appletv");
const credentials_1 = require("../lib/credentials");
const scan_1 = require("./scan");
const pair_1 = require("./pair");
const fs = require("fs");

let pairFilename = 'pair.json';
let defaultPairHex = '';

if (fs.existsSync(pairFilename)) {
    defaultPairHex = JSON.parse(fs.readFileSync('./' + pairFilename));
}

cli
    .version('1.0.20')
    .command('pair', 'Pair with an Apple TV')
    .option('--timeout <timeout>', 'The amount of time (in seconds) to scan for Apple TVs', cli.INTEGER)
    .action((args, options, logger) => {
    scan_1.scan(logger, options.timeout)
        .then(device => {
        device.on('debug', (message) => {
            logger.debug(message);
        });
        device.on('error', (error) => {
            logger.error(error.message);
            logger.debug(error.stack);
        });
        return pair_1.pair(device, logger)
            .then(keys => {
            let data = JSON.stringify({
                data: that.deviceProof.toString('hex'),
            });
            fs.writeFileSync(pairFilename, data);
            process.exit();
        });
    })
        .catch(error => {
        logger.error(error.message);
        logger.debug(error.stack);
        process.exit();
    });
});
cli
    .command('command', 'Send a command to an Apple TV')
    .argument('<command>', 'The command to send', /^up|down|left|right|menu|play|pause|next|previous|suspend|select|tv|longtv$/)
    .option('--credentials <credentials>', 'The device credentials from pairing', cli.STRING)
    .action((args, options, logger) => {
    if (!options.credentials) {
        if (!defaultPairHex) {
            logger.error("Credentials are required. Pair first.");
            process.exit();
        }

        options.credentials = defaultPairHex.data
    }
    let credentials = credentials_1.Credentials.parse(options.credentials);
    scan_1.scan(logger, null, credentials.uniqueIdentifier)
        .then(device => {
        device.on('debug', (message) => {
            logger.debug(message);
        });
        device.on('error', (error) => {
            logger.error(error.message);
            logger.debug(error.stack);
        });
        return device
            .openConnection(credentials)
            .then(() => {
            return device
                .sendKeyCommand(appletv_1.AppleTV.key(args["command"]))
                .then(result => {
                logger.info("Success!");
                process.exit();
            });
        });
    })
        .catch(error => {
        logger.error(error.message);
        logger.debug(error.stack);
        process.exit();
    });
});
cli
    .command('state', 'Logs the playback state from the Apple TV')
    .option('--credentials <credentials>', 'The device credentials from pairing', cli.STRING)
    .action((args, options, logger) => {
    if (!options.credentials) {
        if (!defaultPairHex) {
            logger.error("Credentials are required. Pair first.");
            process.exit();
        }

        options.credentials = defaultPairHex.data
    }
    let credentials = credentials_1.Credentials.parse(options.credentials);
    scan_1.scan(logger, null, credentials.uniqueIdentifier)
        .then(device => {
        device.on('debug', (message) => {
            logger.debug(message);
        });
        device.on('error', (error) => {
            logger.error(error.message);
            logger.debug(error.stack);
        });
        return device
            .openConnection(credentials);
    })
        .then(device => {
        device.on('nowPlaying', (info) => {
            logger.info(info.toString());
        });
    })
        .catch(error => {
        logger.error(error.message);
        logger.debug(error.stack);
        process.exit();
    });
});
cli
    .command('queue', 'Request the playback state from the Apple TV')
    .option('--credentials <credentials>', 'The device credentials from pairing', cli.STRING)
    .option('--location <location>', 'The location in the queue', cli.INTEGER)
    .option('--length <length>', 'The length of the queue', cli.INTEGER)
    .option('--metadata', 'Include metadata', cli.BOOLEAN)
    .option('--lyrics', 'Include lyrics', cli.BOOLEAN)
    .option('--languages', 'Include language options', cli.BOOLEAN)
    .action((args, options, logger) => {
    if (!options.credentials) {
        if (!defaultPairHex) {
            logger.error("Credentials are required. Pair first.");
            process.exit();
        }

        options.credentials = defaultPairHex.data
    }
    let credentials = credentials_1.Credentials.parse(options.credentials);
    scan_1.scan(logger, null, credentials.uniqueIdentifier)
        .then(device => {
        device.on('debug', (message) => {
            logger.debug(message);
        });
        device.on('error', (error) => {
            logger.error(error.message);
            logger.debug(error.stack);
        });
        return device
            .openConnection(credentials);
    })
        .then(device => {
        return device
            .requestPlaybackQueue({
            location: options.location || 0,
            length: options.length || 1,
            includeMetadata: options.metadata,
            includeLyrics: options.lyrics,
            includeLanguageOptions: options.languages
        });
    })
        .then(message => {
        logger.info(message);
    })
        .catch(error => {
        logger.error(error.message);
        logger.debug(error.stack);
        process.exit();
    });
});
cli
    .command('messages', 'Log all messages sent from the Apple TV')
    .option('--credentials <credentials>', 'The device credentials from pairing', cli.STRING)
    .action((args, options, logger) => {
    if (!options.credentials) {
        if (!defaultPairHex) {
            logger.error("Credentials are required. Pair first.");
            process.exit();
        }

        options.credentials = defaultPairHex.data
    }
    let credentials = credentials_1.Credentials.parse(options.credentials);
    scan_1.scan(logger, null, credentials.uniqueIdentifier)
        .then(device => {
        device.on('debug', (message) => {
            logger.debug(message);
        });
        device.on('error', (error) => {
            logger.error(error.message);
            logger.debug(error.stack);
        });
        return device
            .openConnection(credentials);
    })
        .then(device => {
        device.on('message', (message) => {
            logger.info(JSON.stringify(message.toObject(), null, 2));
        });
    })
        .catch(error => {
        logger.error(error.message);
        logger.debug(error.stack);
        process.exit();
    });
});
cli
    .command('guess', 'Guess the restriction passcode for the Apple TV')
    .action((args, options, logger) => {
        scan_1.scan(null, null, credentials.uniqueIdentifier)
        .then(device => {
            device.openConnection(credentials)
            .then(async () => {
                var numbers = [0x027, 0x01E, 0x01F, 0x020, 0x021, 0x022, 0x023, 0x024, 0x025, 0x026];
                for (var _first = 0; _first < numbers.length; _first++) {
                    for (var _second = 0; _second < numbers.length; _second++) {
                    for (var _third = 0; _third < numbers.length; _third++) {
                        for (var _fourth = 0; _fourth < numbers.length; _fourth++) {
                        var code = parseInt(`${digit(numbers[_first])}${digit(numbers[_second])}${digit(numbers[_third])}${digit(numbers[_fourth])}`)
    
                        if (code < 300) {
                            continue;
                        }
    
                        device.sendKeyPressAndRelease(0x07, numbers[_first])
                        await sleep(200);
    
                        device.sendKeyPressAndRelease(0x07, numbers[_second])
                        await sleep(200);
    
                        device.sendKeyPressAndRelease(0x07, numbers[_third])
                        await sleep(200);
    
                        device.sendKeyPressAndRelease(0x07, numbers[_fourth])
    
                        console.log(`Trying ${digit(numbers[_first])}${digit(numbers[_second])}${digit(numbers[_third])}${digit(numbers[_fourth])}`)
                        await sleep(1000);
                        }
                    }
                    }
                }
            });
        });
});

cli.parse(process.argv);

// Hex codes for numbers
// 
// 1 0x018
// 2 0x019
// 3 0x020
// 4 0x021
// 5 0x022
// 6 0x023
// 7 0x024
// 8 0x025
// 9 0x026
// 0 0x027

// Functions for the guess method
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
} 

function digit(hex) {
    var digit = hex - 29

    if (digit > 9) {
        digit = 0
    }

    return digit
}
  