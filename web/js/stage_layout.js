$(document).ready(initStageLayout);

let stageCanvas;
let ctx;

let elementInsertMode = false;
let elementDragMode = false;

let stageElements = [];

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

function handleStageCanvasMouseUp() {
    elementDragMode = false;
    selectedElement = undefined;
}

function createStageElement(x,y,hover,color) {
    let el = {"x":x,"y":y};
    el["color"] = color || "#FA0";
    el["radius"] = 20;
    el["hover"] = hover;
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

function drawStageElement(el) {
    ctx.fillStyle = el.color;
    ctx.beginPath();
    ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2, true);
    ctx.fill();
}

function drawStageCanvas() {
    clearCanvas(stageCanvas);

    for (i in stageElements) {
        let el = stageElements[i];
        drawStageElement(el);
    }

    window.requestAnimationFrame(drawStageCanvas);
}

function clearCanvas(canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}