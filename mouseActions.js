const robot = require('robotjs');
const Audic = require("audic");
const beep = new Audic('./sound/beep-07.mp3');
const readyButton = [1380, 1000];
const mobSecond = [1780,1040];

// SOUND ALERT
export async function playSound() {
    await beep.play();
}

export function startFight() {
    new Promise(resolve => setTimeout(resolve,1500))
        .then(() => {
            robot.moveMouseSmooth(readyButton[0], readyButton[1],1.5);
            robot.mouseClick();
            playSound();
        })
}

export function fight() {
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

export function mine(currentMine) {
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
