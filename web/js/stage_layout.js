$(document).ready(initStageLayout);

let stageCanvas;
let ctx;

let elementInsertMode = false;
let elementDragMode = false;

let stageElements = [];
let keyframes = [];

let selectedElement = undefined;

let elementHighlight = "#FA0";
let elementStandard = "#AAA";

function initStageLayout() {
    stageCanvas = document.getElementById("stage-canvas");
    initCanvas(stageCanvas);

    $("#add-stage-element").click(toggleElementInsertMode);

    window.requestAnimationFrame(drawStageCanvas);
}

function initCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = 500;
    ctx = canvas.getContext("2d");
    $(canvas).click(handleStageCanvasClick);
    $(canvas).dblclick(handleStageCanvasDoubleClick);
    $(canvas).mousemove(handleStageCanvasMouseMove);
    $(canvas).mousedown(handleStageCanvasMouseDown);
    $(canvas).mouseup(handleStageCanvasMouseUp);
}

function handleStageCanvasClick(event) {
    if (elementInsertMode && !elementDragMode) {
        const x = event.offsetX;
        const y = event.offsetY;
        addStageElement(createStageElement(x,y));
    } else {
    }
}

function handleStageCanvasDoubleClick(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    addStageElement(createStageElement(x,y,true,elementHighlight));
    $("#stage-canvas").addClass("stage-canvas-hover");
}


function handleStageCanvasMouseMove(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (!elementDragMode) {
        let isHover = false;

        stageElements.forEach(function(a){
            a.color = elementStandard;
            a["hover"] = false;
        });

        elementsInRange = stageElements.filter(function(a){
            lenX = x - a.x;
            lenY = y - a.y;

            dist = Math.sqrt((lenX*lenX)+(lenY*lenY));
            return dist < a.radius;
        });

        if (elementsInRange.length > 0) {
            elementOnTop = elementsInRange.pop();
            elementOnTop.color = elementHighlight;
            elementOnTop["hover"] = true;
            $("#stage-canvas").addClass("stage-canvas-hover");
        } else {
            $("#stage-canvas").removeClass("stage-canvas-hover");
        }
    } else {
        if (selectedElement) {
            selectedElement.x = x;
            selectedElement.y = y;
        }
    }
}

function handleStageCanvasMouseDown() {
    elementDragMode = true;

    hoveredEls = stageElements.filter(function(el){
        return el.hover;
    });

    selectedElement = hoveredEls[0];
}

function handleStageCanvasMouseUp(event) {

    if(selectedElement) {
        keyframes.push(createKeyframe(selectedElement,event.offsetX, event.offsetY));

    }
    elementDragMode = false;
    selectedElement = undefined;
}

function createKeyframe(element,x,y) {
    let timestamp = document.getElementById("audio-player").currentTime;

    return {
        "timestamp": timestamp,
        "x": x,
        "y": y,
        "elementId": element.id
    };

}

function createStageElement(x,y,hover,color) {
    let el = {"x":x,"y":y};
    el["color"] = color || "#FA0";
    el["radius"] = 20;
    el["hover"] = hover;
    el["id"] = "el-"+(new Date()).getTime();

    keyframes.push(createKeyframe(el,x,y));

    return el;
}

function toggleElementInsertMode() {
    let elementInsertModeClass = "btn-warning";
    let $addElementBtn = $("#add-stage-element");
    $addElementBtn.toggleClass(elementInsertModeClass);
    elementInsertMode = $addElementBtn.hasClass(elementInsertModeClass);
}

function addStageElement(el) {
    stageElements.push(el);
}


function drawStageElement(el,timestamp) {

    let x = el.x;
    let y = el.y;

    ctx.fillStyle = el.color;
    ctx.beginPath();
    ctx.arc(x, y, el.radius, 0, Math.PI * 2, true);
    ctx.fill();

}

function calculateStageElemenLocation(el,timestamp) {
    if (elementDragMode && el == selectedElement) {
        return;
    }

    elKeyframes = keyframes.filter(function(k){
        return k.elementId == el.id;
    });
    elKeyframes = elKeyframes.sort(function(a,b){
        return a.timestamp - b.timestamp;
    });
    keyframeSet = [];
    for (i in elKeyframes) {
        k = elKeyframes[i];
        if (k.timestamp > timestamp) {
            keyframeSet.push(elKeyframes[i-1]);
            keyframeSet.push(k);
            break; // Leave the for loop
        }
    }

    let x = el.x;
    let y = el.y;

    if (keyframeSet.length == 0 || !keyframeSet[0]) {
        k = elKeyframes.filter(function(k1){return k1.timestamp<=timestamp}).pop() || elKeyframes[0];
        x = k.x;
        y = k.y;
    } else if (keyframeSet.length == 1 ) {
        x = keyframeSet[0].x;
        y = keyframeSet[0].y;
    } else if (keyframeSet.length == 2 ) {
        ts0 = keyframeSet[0].timestamp;
        ts1 = keyframeSet[1].timestamp;
        percentBetweenTimestamps = (timestamp-ts0)/(ts1-ts0);
        x = keyframeSet[0].x + percentBetweenTimestamps*(keyframeSet[1].x-keyframeSet[0].x);
        y = keyframeSet[0].y + percentBetweenTimestamps*(keyframeSet[1].y-keyframeSet[0].y);
    }

    el.x = x;
    el.y = y;
    //console.log(x);
}

function drawStageCanvas() {
    let timestamp = document.getElementById("audio-player").currentTime;

    clearCanvas(stageCanvas);

    for (i in stageElements) {
        let el = stageElements[i];
        calculateStageElemenLocation(el,timestamp)
        drawStageElement(el,timestamp);
    }

    window.requestAnimationFrame(drawStageCanvas);
}

function clearCanvas(canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}