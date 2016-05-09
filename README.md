## Overview

At the moment this is in development. The main script is written using TypeScript and ES2015.

This script would be used to trigger events on a page based off the current play time of a video being played on page. Currently I'm using JWPlayer but eventually there will be an adapter so the video player will be irrelevant. In fact, at that point a video would be irrelevant, the only thing that would matter would be that the API could hook up to a single event which emits numbers and then the script would in turn trigger events based on those numbers.

### The cool part
The cool part is that this script will allow for forwards and backwards consuming of events, keep them in order and do it very fast. Why is it fast? Well the class which monitors events keeps a pointer to the last timed event and puts events into chronological order when they are added so it doesn't have to check all events to see which ones should be triggered. Instead it determines the direction of play "forwards" or "backwards" and executes functions in that direction from it's last known pointer until it reaches an event which doesn't meet the time requirements and then stops completelty. All events are debounced as well so they don't execute until the current execution loop is complete. You should debounce your events as well.

#### To Use:

```javascript

const vp = new VideoPlayer('video-player', 'https://www.youtube.com/watch?v=AHKLtpCH2zA');

// Setup the video player
vp.setup();

// Get a TimeLineManager which is associated with video
const tlm = vp.addTimeLineManager();
// Now, create a timeline and add triggers to it. These will be the '
// events which play forward and backwards with video timing.
let tl = new TimeLine();
tl.addTrigger(
  new Trigger(
    1, () => {console.log('1')},
    function() {console.log('backwards!!! 1')}
    ));
tl.addTrigger(
  new Trigger(
    3, () => {console.log('3')},
    function() {console.log('backwards!!! 3')}));
tl.addTrigger(
  new Trigger(
    4, () => {console.log('4')},
    function() {console.log('backwards!!! 4')}));
tlm.pushTimeLine(tl);


// Add another timeline
tl = new TimeLine();
// And then you could repeat the process adding events to this timeline..
```
#### Todo:
> Add Promises
> Demo DOM Events running at 60fps with video.

