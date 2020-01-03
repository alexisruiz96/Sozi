/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

import {Animator} from "./Animator";
import * as Timing from "./Timing";

const DURATION_MS = 500;

let frameList;
let links;
let player;
let animator;
let isOpen = false;
let startOffset = -1;
let endOffset = -1;
let currentOffset = startOffset;

export function init(aPlayer) {
    player = aPlayer;

    frameList = document.querySelector(".sozi-frame-list");
    links = frameList.querySelectorAll("li a");
    
    for (let link of links) {
        link.addEventListener("click", evt => {
            if (evt.button === 0) {
                player.previewFrame(link.hash.slice(1));
                evt.preventDefault();
            }
        });
    }

    animator = new Animator();
    animator.addListener("step", onAnimatorStep);
    window.addEventListener("keypress", onKeyPress, false);
    window.addEventListener("resize", () => setCurrentOffset(currentOffset));
    player.viewport.addListener("mouseDown", onMouseDown);
    frameList.addEventListener("mouseout", onMouseOut, false);
    aPlayer.addListener("frameChange", onFrameChange);
    setCurrentOffset(startOffset);
}

function setCurrentOffset(offset) {
    currentOffset = offset;
    frameList.style.left = currentOffset * frameList.offsetWidth + "px";
}

function moveTo(offset) {
    player.pause();
    startOffset = currentOffset;
    endOffset = offset;
    animator.start(Math.abs(endOffset - startOffset) * DURATION_MS);
}

export function open() {
    moveTo(0);
}

export function close() {
    moveTo(-1);
}

export function toggle() {
    moveTo(-1 - endOffset);
}

function onKeyPress(evt) {
    // Keys with modifiers are ignored
    if (evt.altKey || evt.ctrlKey || evt.metaKey) {
        return;
    }

    switch (evt.charCode || evt.which) {
        case 84: // T
        case 116: // t
            if (player.presentation.enableKeyboardNavigation) {
                player.disableBlankScreen();
                toggle();
            }
            break;
        default:
            return;
    }

    evt.stopPropagation();
    evt.preventDefault();
}

function onAnimatorStep(progress) {
    const p = Timing.ease(progress);
    setCurrentOffset(endOffset * p + startOffset * (1 - p));
}

function onMouseDown(button) {
    if (player.presentation.enableMouseNavigation && button === 1) {
        toggle();
    }
}

function onMouseOut(evt) {
    let rel = evt.relatedTarget;
    while (rel && rel !== frameList && rel !== document.documentElement) {
        rel = rel.parentNode;
    }
    if (rel !== frameList) {
        close();
        evt.stopPropagation();
    }
}

function onFrameChange() {
    for (let link of links) {
        link.className = link.hash === "#" + player.currentFrame.frameId ?
            "current" :
            "";
    }
}
