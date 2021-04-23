const ByteArray = require('bytearray');
const Cap = require('cap').Cap;
const decoders = require('cap').decoders;
const PROTOCOL = decoders.PROTOCOL;
const c = new Cap();
const device = Cap.findDevice('192.168.1.31');
// const filter = 'tcp and dst port 5555';
const filter = 'tcp and src port 5555';
const bufSize = 10 * 1024 * 1024;
const buffer = Buffer.alloc(535 );
const Audic = require("audic");
const beep = new Audic('./sound/beep-07.mp3');
const robot = require('robotjs');
var helper = false;
const readyButton = [1380, 1000];
const mobSecond = [1780,1040];
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
const  tinKoalak = require('./miner/tinKoalak');
const currentMine = tinKoalak;

robot.setMouseDelay(currentMine.mouseDelay);
// START
console.log("LET'S MINE!");



const tinCaniaDung = [
    [512, 529],
    [547, 532],
    [1151,468],
    [1230, 502],
    [1265, 540]
]

const mapmthreenine = [
    [161, 166, 3, 570, 700], // 1
    [160, 152, 3, 600, 700], // 2
    [159, 253, 2, 700, 650], // 3
    [155, 169, 2, 700, 450],
    [153,156, 2 , 730, 450],
    [151, 129, 2, 820, 430],
    [236, 243, 1, 880, 430],
    [148, 216, 1, 940, 420],
    [149, 217, 1, 1000, 400],
    [152, 133, 2, 1150, 400], //10
    [237, 162, 2, 1220, 430],
    [156, 176, 2, 1270, 450],
    [157, 219, 2, 1320, 550],
    [158, 233, 2, 1360, 550] // 14
]

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
        if (key.name === 'right') {
            console.log(robot.getMousePos());
        }
    }
})

// SOUND ALERT
async function playSound() {
    await beep.play();
}

var linkType = c.open(device, filter, bufSize, buffer);

c.setMinBytes && c.setMinBytes(0);

c.on('packet', (nbytes, trunc) => {
    if (linkType === 'ETHERNET') {
        var ret = decoders.Ethernet(buffer);
        if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
            ret = decoders.IPV4(buffer, ret.offset);
            if (ret.info.protocol === PROTOCOL.IP.TCP) {
                var datalen = ret.info.totallen - ret.hdrlen;
                ret = decoders.TCP(buffer, ret.offset);
                datalen -= ret.hdrlen;
                const dataBuffer = buffer.slice(54,nbytes-1);



                if(dataBuffer[0] == 71 && dataBuffer[1]==161 && dataBuffer[9] === 0) {
                    console.log("Ore do zrobienia! ", dataBuffer[6], dataBuffer[7]);
                    if(helper){
                        mine();
                    }
                }


                if(helper) {
                    if (dataBuffer[0] === 133 && dataBuffer[1] === 137) {
                        robot.moveMouseSmooth(readyButton[0], readyButton[1],1.5);
                        robot.mouseClick();
                    }
                    if ( (dataBuffer[0] === 73 && dataBuffer[1] === 233)){
                        playSound();
                        robot.setMouseDelay(500);
                        robot.moveMouseSmooth(1010, 980,1.3);
                        robot.mouseClick();
                        robot.moveMouseSmooth(mobSecond[0],mobSecond[1],1.3);
                        robot.mouseClick();
                        robot.moveMouseSmooth(readyButton[0],readyButton[1], 1.6);
                        robot.mouseClick();
                        robot.setMouseDelay(0);

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

function mine() {
    new Promise(resolve => setTimeout(resolve,getRandomInt(1000,1600)))
        .then(()=> {
            robot.keyToggle('shift', 'down');
            currentMine.mousePositions.map(position => {
                robot.moveMouseSmooth(position[0],position[1],1.3);
                robot.mouseClick();
            })
            robot.keyToggle('shift', 'up');
        })
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}











