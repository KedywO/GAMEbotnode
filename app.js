const Cap = require('cap').Cap;
const decoders = require('cap').decoders;
const PROTOCOL = decoders.PROTOCOL;
const c = new Cap();
const device = Cap.findDevice('192.168.1.31');
const filter = 'tcp and src port 5555';
const bufSize = 10 * 1024 * 1024;
const buffer = Buffer.alloc(535 );
const robot = require('robotjs');
const readline = require('readline');
const fs = require('fs');
const Audic = require("audic");
const beep = new Audic('./sound/beep-07.mp3');
const tinCaniaKretk = require('./miner/tinCanieKrtek');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var currentMine = tinCaniaKretk;
var helper = true;
var globalCounter = 0;
var timeStart;
const readyButton = [1380, 1000];
const mobSecond = [1780,1040];
robot.setMouseDelay(currentMine.mouseDelay);
var tripCreator = false;
var newPath = {
    mouseDelay: 40,
    mousePositions: [],
    name: ''
}
Date.prototype.addSeconds = function(sec) {
    this.setTime(this.getTime() + (sec*1000));
    return this;
}
// START
console.log("LET'S MINE!");

fs.readFile('test.txt', 'utf-8',(err, data) => {
    let pathsFromFile = data && fileToPath(data);
    console.log('Choose your path by writing it name! If you want to add new path press ENTER then F11');
    console.log(pathsFromFile && pathsFromFile.forEach(path => {
        console.log(`Path: ${path.name}`);
    }));
    if(pathsFromFile && pathsFromFile.length !== 0) {
        rl.question("Name: ", answer => {
            pathsFromFile.forEach(path => {
                if (answer.trim().toUpperCase() === path.name.trim().toUpperCase()) {
                    currentMine = path;
                }
            })
            if(answer) console.log(currentMine, ` have been chosen.`);
        })
    }
})

process.stdin.on('keypress', (str, key) => {
    if ( key.ctrl && key.name === 'c') {
        console.log("Wychodze");
        process.exit();
    } else {
        if (key.name === 'f12') { // TURN OF HELPER TO GET PACKET PING
            helper = !helper
            console.log(`Helper is ${helper}`);
        }
        if(key.name === 'f1') {
            // console.log(`Starting path: ${currentMine.name}`);
            pathMaker(currentMine);
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
            // globalCounter++;
        }
        if (key.name === 'right') { // READ CURRENT MOUSE POSITION
            console.log(robot.getMousePos());
        }
        if (key.name === 'space') {
            if(tripCreator) {
                console.log(robot.getMousePos().x, robot.getMousePos().y);
                newPath.mousePositions.push([robot.getMousePos().x,robot.getMousePos().y]);

            }
        }
        if (key.name === 'del') {
            newPath.mousePositions.pop();
        }
    }
})

var linkType = c.open(device, filter, bufSize, buffer);

c.setMinBytes && c.setMinBytes(0);

c.on('packet', async (nbytes, trunc) => {
    if (linkType === 'ETHERNET') {
        var ret = decoders.Ethernet(buffer);
        if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
            ret = decoders.IPV4(buffer, ret.offset);
            if (ret.info.protocol === PROTOCOL.IP.TCP) {
                var datalen = ret.info.totallen - ret.hdrlen;
                ret = decoders.TCP(buffer, ret.offset);
                datalen -= ret.hdrlen;
                const dataBuffer = buffer.slice(54,nbytes-1);
                // if(dataBuffer[0] == 53 && dataBuffer[1]== 181) { // WEJSCIE NA MAPE
                //     timeStart = new Date().addSeconds(10);
                // }
                // if(dataBuffer[0] == 62 && dataBuffer[1]== 153) { // ZACZECIE KOPANIA
                //     timeStart = new Date().addSeconds(10);
                // }
                if(dataBuffer[0] == 70 && dataBuffer[1]== 81 && dataBuffer[dataBuffer.length-1] == 115) { // RUSZENIE SIE
                    timeStart = new Date().addSeconds(10);
                }
                if(dataBuffer[0] == 109 && dataBuffer[1]== 210) { // ZALADOWANIE SIE MAPY
                    // playSound();
                    console.log("6d d2")
                    if(helper){
                        globalCounter++;
                    }
                }
                if(dataBuffer[0] == 143 && dataBuffer[1]== 209) { // ZALADOWANIE SIE MAPY
                    // playSound();
                    console.log("8f d1")
                    if(helper){
                        globalCounter++;
                    }
                }


                if(helper) {
                    if (dataBuffer[0] === 105 && dataBuffer[1] === 9) {
                        // startFight();
                    }
                    if ( (dataBuffer[0] === 47 && dataBuffer[1] === 165)){
                        playSound();
                        // fight();
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
// 255 516
const pathMaker = async (currentPath) => {
    let temp = globalCounter;
    console.log("Current path: " + currentPath.name)
    while (true) {
        for (let i = 0; i < currentPath.mousePositions.length; i++) {
            await new Promise(res => setTimeout(res, 500))
            robot.moveMouse(currentPath.mousePositions[i][0], currentPath.mousePositions[i][1]);
            await new Promise(res => setTimeout(res, 200));
            robot.mouseClick();
            console.log("Clicking " + currentPath.mousePositions[i][0] + " " + currentPath.mousePositions[i][1])
            timeStart = new Date();
            temp = await timer(temp);
        }
    }
}

const timer = async (temp) => {
    while (true) {
        console.log(new Date() - timeStart);
        if(temp < globalCounter) {
            break;
        }else if(new Date() - timeStart > 2000){
            console.log("TIME IS UP!")
            globalCounter++;
            break
        }
        await new Promise(res => setTimeout(res, 700))
    }
    return globalCounter;
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

async function playSound() {
    await beep.play();
}












