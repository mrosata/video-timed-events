/// <reference path="/home/michael/.WebStorm2016.1/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_jwplayer_jwplayer.d.ts" />
"use strict";
/**
 * Video Player
 *
 * For now this uses jwplayer, eventually this should be more generic and allow
 * the developer to use any video player as long as they can write an adapter to
 * trigger the timeLineManager.updateTime function.
 */
class VideoPlayer {
    constructor(container, video) {
        this.video = '';
        this.image = '';
        this.timeLineManagers = [];
        this.container = container;
        this.video = video;
    }
    setup() {
        this.player = jwplayer(this.container);
        this.player
            .setup({
            flashplayer: "/scripts/jwplayer/jwplayer.flash.swf",
            width: "600",
            height: "300",
            file: this.video,
            //TODO: check if userhtml5 and html5player are actual config options.
            usehtml5: true,
            html5player: true
        })
            .on('time', (event) => {
            // Run through all the TimeLineManagers so that any triggers on any TimeLines
            // for this video will be updated. At the moment there will be 0 TimeLineManagers
            // just run this.addTimeLineManager() to create a new one. Then add events to it.
            this.timeLineManagers.forEach((currentTLM) => {
                currentTLM.updateTime(event.position);
            });
        });
    }
    /**
     * Create a new timeline manager and add it to the Array
     * of TimeLineManagers which are updated every time
     * the videos time is updated.
     * @return TimeLineManager
     */
    addTimeLineManager() {
        const tlm = new TimeLineManager();
        this.timeLineManagers.push(tlm);
        return tlm;
    }
}
// The class Trigger isn't needed to use as a trigger. It's just handy
// to use the constructor as a factory.
class Trigger {
    constructor(time, action = function () { }, undo = function () { }) {
        this.single = false;
        this.multi = false;
        this.time = time;
        this.action = action;
        this.undo = undo;
    }
}
class TimeLine {
    constructor(videoId) {
        this.length = 0;
        this.pointer = -1;
        this.videoId = '';
        this.triggers = [];
    }
    scheduleNext(event) {
        return window.requestAnimationFrame(() => {
            event();
        });
    }
    /**
     * Add a new trigger to the TimeLine.
     * @param trigger
     * @return number - Index of new trigger
     */
    addTrigger(trigger) {
        if (this.length === 0) {
            this.pointer = 0;
            return (this.length = this.triggers.push(trigger)) - 1;
        }
        // Let's assume the developer might add the triggers in
        // chronological order.
        let len = this.length;
        while (len--) {
            if (trigger.time > this.triggers[len].time) {
                // Insert the new trigger at the correct location in the TimeLine array
                this.triggers = this.triggers.slice(0, len + 1).concat(trigger).concat(this.triggers.slice(len + 1));
                // Update the private length property
                // TODO: this.length should be a getter. Shouldn't have to explicitly set it.
                this.length = this.triggers.length;
                return len;
            }
        }
        // TODO: Maybe move this part above the loop? It could be move performant.
        // The event should actually be at index 0
        this.triggers.unshift(trigger);
        // The pointer should be 1 back since we're pushing a new item to index 0.
        this.pointer = Math.max(0, this.pointer - 1);
        // TODO: Remove this next line once this.length becomes a getter.
        this.length = this.triggers.length;
        return 0;
    }
    andThenAt(time, action) {
        /// This has to return a Promise which will resolve at a specific time.
        return new Promise((resolve, reject) => {
        });
    }
    runForwardTil(time) {
        let nextTrigger;
        nextTrigger = this.triggers[this.pointer];
        while (this.pointer < this.triggers.length && nextTrigger.time <= time) {
            // Run the next event
            this.scheduleNext(nextTrigger.action);
            // If there are more triggers in this.triggers then increment the pointer.
            if (this.pointer++ < this.triggers.length) {
                nextTrigger = this.triggers[this.pointer];
            }
        }
    }
    runBackTil(time) {
        if (this.pointer < 1) {
            // No triggers have been triggered so there is nothing to run back through.
            return void 0;
        }
        let prevTrigger;
        prevTrigger = this.triggers[--this.pointer];
        while (this.pointer > 0 && prevTrigger.time >= time) {
            // Run the next event
            this.scheduleNext(prevTrigger.undo);
            // If there are more triggers in this.triggers then increment the pointer.
            if (this.pointer-- > 1) {
                prevTrigger = this.triggers[this.pointer];
            }
        }
    }
}
/**
 * TimeLineManager
 *
 * Holds all the timelines which in turn hold user callbacks for triggers
 * that are supposed to run at specific times. TimelineManager needs to
 * make sure that events are ran 1 time forward and potentially 1 time back.
 */
class TimeLineManager {
    constructor() {
        this.times = [0, 0];
        this.timeLines = [];
    }
    construct() { }
    updateTime(currentPos) {
        const prevPos = this.times[1];
        if (currentPos === prevPos) {
            // The video hasn't moved at all so don't even mutate times array
            return void 0;
        }
        // Push new video position onto this.times and remove the last prev postition
        this.times.push(currentPos);
        this.times.shift();
        // Check if video is moving forward or backward then loop through any
        // timelines and consume triggers between currentPos and prevPos
        const movingForward = (prevPos < currentPos);
        this.timeLines.forEach((timeLine) => {
            return movingForward ? timeLine.runForwardTil(currentPos) : timeLine.runBackTil(currentPos);
        });
    }
    pushTimeLine(tl, retroactive = false) {
        this.timeLines.push(tl);
        // If the timeline is added after video has been playing and retroactive is true
        // then play through TimeLine as if it was added already
        if (retroactive && this.times[1] > 0) {
            tl.runForwardTil(this.times[1]);
        }
        return this.timeLines.length;
    }
}
class NextPromise {
    static next() {
        if (NextPromise.actions.length > NextPromise.ind) {
            NextPromise.ind++;
            return (() => {
                NextPromise.factory(NextPromise.actions[NextPromise.ind - 1]);
            })();
        }
    }
    static factory(fn) {
        const p = new Promise((resolve, reject) => {
            window.setTimeout(() => {
                fn();
                resolve({ fn: fn });
            }, 600);
        });
        return p.then(NextPromise.next);
    }
}
NextPromise.ind = 0;
NextPromise.actions = [() => { }];
//# sourceMappingURL=stayshine-interactive-video.js.map