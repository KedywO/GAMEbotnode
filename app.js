const Cap = require('cap').Cap;
const decoders = require('cap').decoders;
const PROTOCOL = decoders.PROTOCOL;
const c = new Cap();
require('dotenv').config();
const device = Cap.findDevice(process.env.IP_ADDRESS);
const filter = 'tcp and src port 5555';
const bufSize = 10 * 1024 * 1024;
const buffer = Buffer.alloc(535);
// SOUNDS
const Audic = require("audic");
const beep = new Audic('./sound/beep-07.mp3');
const police = new Audic('./sound/police.mp3');

const robot = require('robotjs');

// MOUSE AND KB LISTNER
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const  tinKoalak = require('./miner/tinKoalak');
const tinCaniaKrtek = require('./miner/tinCaniaKrtek');

const currentMine = tinCaniaKrtek;
const readyButton = [1380, 1000];
const mobSecond = [1780,1040];
var helper = false;

robot.setMouseDelay(currentMine.mouseDelay);
// START
console.log("LET'S MINE!");

process.stdin.on('keypress', (str, key) => {
    if ( key.ctrl && key.name === 'c') {
        console.log("Wychodze");
        process.exit();
    } else {
        if (key.name === 'f12') {
            helper = !helper
            console.log(`Helper is ${helper}`);
        }
        if (key.name === 'up') {
            mine();
        }
        if (key.name === 'down') {
            fight();
        }
        if (key.name === 'right') {
            console.log(robot.getMousePos());
        }
    }
})

// SOUND ALERT


var linkType = c.open(device, filter, bufSize, buffer);

c.setMinBytes && c.setMinBytes(0);

c.on('packet', (nbytes, trunc) => {
    if (linkType === 'ETHERNET') {
        var ret = decoders.Ethernet(buffer);
        if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
            ret = decoders.IPV4(buffer, ret.offset);
            if (ret.info.protocol === PROTOCOL.IP.TCP) {
                const dataBuffer = buffer.slice(54,nbytes-1);
                // ORE RESPAWN
                if(dataBuffer[0] == 71 && dataBuffer[1]==161 && dataBuffer[9] === 0) {
                    console.log("Ore to do! ", dataBuffer[6], dataBuffer[7]);
                    playSound();
                    if(helper){
                        mine();
                    }
                }

                if(helper) {
                    // PROTECTOR FIGHT
                    if ((dataBuffer[0] === 73 && dataBuffer[1] === 233)){
                        playPolice();
                        fight();
                    }
                }
            } else if (ret.info.protocol === PROTOCOL.IP.UDP) {
                console.log('Decoding UDP ...');

                ret = decoders.UDP(buffer, ret.offset);
                console.log(' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport);
                console.log(buffer.toString('binary', ret.offset, ret.offset + ret.info.length));
            } else
                console.log('Unsupported IPv4 protocol: ' + PROTOCOL.IP[ret.info.protocol]);
        } else
            console.log('Unsupported Ethertype: ' + PROTOCOL.ETHERNET[ret.info.type]);
    }
});

function fight() {
    new Promise(resolve => setTimeout(resolve, 5000))
        .then(() => {
            robot.setMouseDelay(500);
            robot.moveMouseSmooth(1010, 980,1.3);
            robot.mouseClick();
            robot.moveMouseSmooth(mobSecond[0],mobSecond[1],1.3);
            robot.mouseClick();
            robot.moveMouseSmooth(readyButton[0],readyButton[1], 1.6);
            robot.mouseClick();
            robot.setMouseDelay(40);
        })
}

function mine() {
    new Promise(resolve => setTimeout(resolve,getRandomInt(1500,2000)))
        .then(()=> {
            robot.keyToggle('shift', 'down');
            currentMine.mousePositions.map(position => {
                robot.moveMouseSmooth(position[0],position[1],1.3);
                robot.mouseClick();
            })
            robot.keyToggle('shift', 'up');
            robot.moveMouse(303, 808);
        })
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// SOUND FUNCS
async function playSound() {
    await beep.play();
}

async function playPolice() {
    await police.play();
}











