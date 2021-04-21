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

var helper = true;
console.log("LET'S MINE!");
const readyButton = [1380, 1000];
const mobSecond = [1780,1040];

// robot.setKeyboardDelay(2000);


// const readline = require('readline');
// readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true);
// process.stdin.on('keypress', (str, key) => {
//     if (key.ctrl && key.name === 'c') {
//         process.exit();
//     } else {
//         if(key.name === 'f12') {
//             helper = !helper;
//             helper ? console.log("HELPER IS ON!") : console.log("HELPER IS OFF!");
//
//         }
//         if(key.name === 'up') {
//             robot.moveMouse(1010,980);
//         }
//     }
// });
// console.log('Press any key...');

const mapmthreenine = [
    [161, 166, 3, 570, 700],
    [160, 152, 3, 590, 700],
    [159, 253, 2, 700, 650],
    [155, 169, 2, 700, 450],
    [153,156, 2 , 730, 450],
    [151, 129, 2, 820, 430],
    [236, 243, 1, 880, 430],
    [148, 216, 1, 940, 420],
    [149, 217, 1, 1000, 400],
    [152, 133, 2, 1160, 400],
    [237, 162, 2, 1220, 430],
    [156, 176, 2, 1270, 450],
    [157, 219, 2, 1320, 550],
    [158, 233, 2, 1360, 550]
]

var linkType = c.open(device, filter, bufSize, buffer);

c.setMinBytes && c.setMinBytes(0);

c.on('packet',function(nbytes, trunc) {
    // console.log('packet: length ' + nbytes + ' bytes, truncated? '
    //     + (trunc ? 'yes' : 'no'));
    // raw packet data === buffer.slice(0, nbytes)
    if (linkType === 'ETHERNET') {
        var ret = decoders.Ethernet(buffer);

        if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
            // console.log('Decoding IPv4 ...');
            ret = decoders.IPV4(buffer, ret.offset);
            // console.log('from: ' + ret.info.srcaddr + ' to ' + ret.info.dstaddr);
            // console.log(ret.info.protocol, "protocol")
            if (ret.info.protocol === PROTOCOL.IP.TCP) {
                var datalen = ret.info.totallen - ret.hdrlen;
                // console.log('Decoding TCP ...', ret.offset);
                ret = decoders.TCP(buffer, ret.offset);
                // console.log(' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport);
                datalen -= ret.hdrlen;
                const dataBuffer = buffer.slice(54,nbytes-1);
                if(dataBuffer[0] == 71 && dataBuffer[1]==161) {
                    console.log("Ore do zrobienia! ", dataBuffer[6], dataBuffer[7]);
                    playSound();
                    // robot.setMouseDelay(0);
                    check(dataBuffer);

                }
                if(helper) {
                    if (dataBuffer[0] === 133 && dataBuffer[1] === 137) {
                        robot.setMouseDelay(500);
                        click(readyButton[0], readyButton[1]);
                    }
                    if ((dataBuffer[0] === 7 && dataBuffer[1] === 205) || (dataBuffer[0] === 56 && dataBuffer[1] === 85)){
                        robot.setMouseDelay(500);
                        robot.moveMouseSmooth(1010, 980,1.3);
                        robot.mouseClick();
                        robot.moveMouseSmooth(mobSecond[0],mobSecond[1],1.3);
                        robot.mouseClick();
                        robot.moveMouseSmooth(readyButton[0],readyButton[1], 1.6);
                        robot.mouseClick();

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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function click(x, y) {
     new Promise(resolve => setTimeout(resolve, 1200))
        .then(() => {
            robot.moveMouseSmooth(x, y, 1.2);
            robot.mouseClick();
        })
}

function check(dataBuffer) {
    mapmthreenine.map( number => {
        // console.log(number, "   BUFFER  ", dataBuffer[6], dataBuffer[7], dataBuffer[8]);
        if(typeof(number) === 'object') {
            if(number[0] === dataBuffer[6] && number[1] === dataBuffer[7] &&  dataBuffer[9] === 0) {
                robot.keyToggle('shift', 'down');
                click(number[3], number[4]);
                // robot.keyToggle('shift', 'up');
            }
        }
    })
}

function getMsgFromBuffer(dataBuffer){
    const msgSize = dataBuffer.readInt8(5);
    const msgBuffer = dataBuffer.slice(6, msgSize+6);
    console.log(msgBuffer.toJSON().data, msgSize)
    return msgBuffer.toString('utf8');

}

async function playSound() {
    beep.play();
    await new Promise(r => setTimeout(r, 500));
}

// function decode (s) {
//     if (s.indexOf('%') === -1 && s.indexOf('+') === -1) { return s }
//
//     let len = s.length
//     let sb
//     let c
//
//     for (let i = 0; i < len; i++) {
//         c = s.charAt(i)
//         if (c === '%' && i + 2 < len && s.charAt(i + 1) !== '%') {
//             if (s.charAt(i + 1) === 'u' && i + 5 < len) {
//                 // unicode hex sequence
//                 try {
//                     sb.push(parseInt(s.substring(i + 2, i + 4), 16))
//                     i += 2
//                 } catch (e) {
//                     sb.push('%')
//                 }
//             } else {
//                 try {
//                     s.push(parseInt(s.substring(i + 1, i + 3), 16))
//                     i += 2
//                 } catch (e) {
//                     sb.push('%')
//                 }
//             }
//             continue
//         }
//
//         if (c === '+') {
//             sb.push(' ')
//         } else {
//             sb.push(c)
//         }
//     }
//     return sb.join('')
// }






// _messagesTypes[2388] = GameEntityDispositionMessage;
// _messagesTypes[5628] = GameEntityDispositionErrorMessage;
// _messagesTypes[5133] = GameEntitiesDispositionMessage;
