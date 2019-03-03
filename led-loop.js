const {getFirstPozyxSerial} = require('./dist/index');

const pozyx = getFirstPozyxSerial();

let i = 0;
pozyx.init()
  .catch(console.error) 
  .then(() => pozyx.setLEDControl([true, true, true, true]))
  .then(nextLED);

function nextLED() {
  let states = [false, false, false, false];
  states[i * 2] = true;

  i++;

  if (i > 2) i = 0;

  return pozyx.setLEDStates(states)
    .then(() => new Promise(resolve => setTimeout(resolve, 300)))
    .then(nextLED);
}
