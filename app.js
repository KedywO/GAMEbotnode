const ByteArray = require('bytearray');
const Cap = require('cap').Cap;
const decoders = require('cap').decoders;
const PROTOCOL = decoders.PROTOCOL;
const c = new Cap();
const device = Cap.findDevice('192.168.1.31');
const filter = 'tcp and src port 5555';
const bufSize = 10 * 1024 * 1024;
const buffer = Buffer.alloc(535 );
const Audic = require("audic");
const beep = new Audic('./sound/beep-07.mp3');
const robot = require('robotjs');
const readline = require('readline');
const fs = require('fs');
const  tinKoalak = require('./miner/tinKoalak');
const tinCaniaKretk = require('./miner/tinCanieKrtek');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var currentMine = tinCaniaKretk;
var helper = true;
const readyButton = [1380, 1000];
const mobSecond = [1780,1040];
robot.setMouseDelay(currentMine.mouseDelay);
var tripCreator = false;
var newPath = {
    mouseDelay: 40,
    mousePositions: [],
    name: ''
}
var pathsFromFile;
// START
console.log("LET'S MINE!");

// fs.readFile('test.txt', 'utf-8',(err, data) => {
//     pathsFromFile = fileToPath(data);
//     console.log('Choose your path by writing it name! If you want to add new path press ENTER then F11');
//     console.log(pathsFromFile.forEach(path => {
//         console.log(`Path: ${path.name}`);
//     }));
// })
//
// rl.question("Name: ", answer => {
//     pathsFromFile.forEach(path => {
//         if(answer.trim().toUpperCase() === path.name.trim().toUpperCase()){
//             currentMine = path;
//         }
//     })
//     console.log(`${currentMine.name} have been chosen.`);
// })

process.stdin.on('keypress', (str, key) => {
    if ( key.ctrl && key.name === 'c') {
        console.log("Wychodze");
        process.exit();
    } else {
        if (key.name === 'f12') {
            helper = !helper
            console.log(`Helper is ${helper}`);
        }
        if(key.name === 'f1') {
            console.log(`Starting path: ${currentMine.name}`);
            currentMine.mousePositions.forEach(point => {
                new Promise(resolve => setTimeout(5000))
                    .then(() => {
                        robot.moveMouse(point[0], point[1]);
                        robot.mouseClick();
                    })
            })
        }
        if (key.name === 'f11') {
            if(tripCreator) {
                rl.question(`Do you wanna save path named ${newPath.name}? YES OR NO`, name => {
                    if(name.trim().toUpperCase() == 'YES') {
                        if (addPath(newPath)) console.log(`New path added!`);
                        tripCreator = !tripCreator;
                        console.log(`Trip creator is ${tripCreator}`);
                    }
                })

            }else {
                newPath.name = '';
                newPath.mousePositions = [];
                rl.question("Name your path: ", name => {
                    console.log(`You have chosen ${name}`);
                    newPath.name = name;
                    console.log("Now u can add mouse points by pressing SPACE.");
                    console.log("Remember to focus on bot window before every add!");
                    tripCreator = !tripCreator;
                    console.log(`Trip creator is ${tripCreator}`);
                })

            }

        }
        if (key.name === 'up') {
            mine();
            playSound();

        }
        if (key.name === 'right') {
            console.log(robot.getMousePos());
        }
        if (key.name === 'down') {
            const data = pathToFile(currentMine);
            console.log(data);
            fs.writeFile("test.txt", data, err => {
                if (err) console.log({error : err});
            })
        }
        if (key.name === 'left') {
            fs.readFile('test.txt', 'utf-8', (err, data) => {
                if(data) fileToPath(data);
                if(err) console.log(err);
            })
        }
        if (key.name === 'space') {
            if(tripCreator) {
                console.log(typeof robot.getMousePos(), robot.getMousePos().x);
                newPath.mousePositions.push([robot.getMousePos().x,robot.getMousePos().y]);

            }
        }
        if (key.name === 'del') {
            newPath.mousePositions.pop();
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



                if(dataBuffer[0] == 77 && dataBuffer[1]==61 && dataBuffer[9] === 0) {
                    console.log("Ore do zrobienia! ", dataBuffer[6], dataBuffer[7]);
                    playSound();
                    if(helper){
                        mine();
                    }
                }


                if(helper) {
                    if (dataBuffer[0] === 105 && dataBuffer[1] === 9) {
                        startFight();
                    }
                    if ( (dataBuffer[0] === 47 && dataBuffer[1] === 165)){
                        playSound();
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

function startFight() {
    new Promise(resolve => setTimeout(resolve,1500))
        .then(() => {
            robot.moveMouseSmooth(readyButton[0], readyButton[1],1.5);
            robot.mouseClick();
            playSound();
        })
}

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
        });
}

function mine() {
    new Promise(resolve => setTimeout(resolve, getRandomInt(100,200)))
        .then(()=> {
            robot.keyToggle('shift', 'down');
            currentMine.mousePositions.map(position => {
                robot.moveMouseSmooth(position[0],position[1],1.3);
                robot.mouseClick();
            })
            robot.keyToggle('shift', 'up');
        })
}

async function addPath(pathJSON) {
    let tempData;
    await fs.readFile("test.txt", 'utf-8', (err, data) => {
        tempData = fileToPath(data);
        tempData.push(pathJSON);
        fs.writeFile('test.txt', pathToFile(tempData), err => {
        if(err) {
            console.log(err);
            return false
        }else return true
        });
    })

}


function pathToFile(paths) {
    let pathsStringB = '';
    paths.forEach(path => {
        let pathString = `${path.name},`;
        path.mousePositions.forEach(point => {
            if(typeof point === 'object'){
                point.forEach(xy => {
                    pathString += `${xy},`;
                });
            }
        })
        pathString += ';';
        pathsStringB += pathString;
    })
    return pathsStringB;

}

function fileToPath(data) {
    const pathsString = data.split(';');
    let pathsJSON = [];
    pathsString.forEach(pathString => {
        const pathSplit = pathString.split(',');
        let pathJSON = {
            mouseDelay: 40,
            mousePositions: [],
            name: pathSplit[0]
        }
        for (let i = 1; i < pathSplit.length-1; i+=2) {
            pathJSON.mousePositions.push([pathSplit[i], pathSplit[i+1]]);
        }
        pathsJSON.push(pathJSON);

    })
    pathsJSON.pop();
    return pathsJSON;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}











