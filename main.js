import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.148.0/examples/jsm/controls/OrbitControls.js';


// ================================= SCENE SETUP ====================================================================

// increases the pixels of the renderer canvas by multiplying it by resolution
const resolution = 2;

// Renderer Setup
const rendererCanvas = document.querySelector('.webgl');

const viewportCanvas = { width: 600, height: 600 };
rendererCanvas.style.width = viewportCanvas.width + 'px';  // half size display
rendererCanvas.style.height = viewportCanvas.height + 'px';

const rendererWindowWidth = viewportCanvas.width * resolution;
const rendererWindowHeight = viewportCanvas.height * resolution;

const renderer = new THREE.WebGLRenderer({ canvas: rendererCanvas, antialias: true, alpha: true });
renderer.setSize(rendererWindowWidth, rendererWindowHeight, false);
renderer.setClearColor("#000000", 0);

const scene = new THREE.Scene();

// Camera
const camera = new THREE.OrthographicCamera(rendererWindowWidth / - 2, rendererWindowWidth / 2, rendererWindowHeight / 2, rendererWindowHeight / - 2, 0.1, 1000);
camera.position.z = 100;
camera.zoom = 16 * resolution;
camera.updateProjectionMatrix();

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

scene.add(camera);

// Reposition the user back to original position, angle, zoom, and center of rotation
const buttonResetCamPos = document.getElementById("buttonResetCamPos");
buttonResetCamPos.addEventListener('click', function () {
    const camReset = confirm("Reset Camera Position and Rotation?");
    if (camReset) {
        // reset all camera data to its default (what I set previously)
        camera.position.set(0,0,100);
        camera.rotation.set(0,0,0);
        camera.zoom = 16*resolution;
        camera.updateProjectionMatrix();

        // put the controls' center point of rotation back to the player model
        controls.target.set(0,0,0);
    }
});

// Light
const cameraLight = new THREE.DirectionalLight("white", 0.5);
scene.add(cameraLight);
const sliderCameraLighting = document.getElementById('cameraLighting');

const ambientLight = new THREE.AmbientLight("white", 0.5)
scene.add(ambientLight);
const sliderAmbientLighting = document.getElementById('roomBrightness');


const lightCheckerboardCanvas = document.getElementById("lightCheckerboardCanvas");

let camLtemp = 0, ambLtemp = 0;
function updateLightIntensity() {
    // this is just for less letters // total of both sliders for light
    let totalLightSliderValue = Number(sliderCameraLighting.value) + Number(sliderAmbientLighting.value);
    // if total light is under 1, then render both lights as is with the current slider value
    if ((totalLightSliderValue) < 1) {
        camLtemp = sliderCameraLighting.value;
        ambLtemp = sliderAmbientLighting.value;
    // if total light is bigger than 1, then ambient light overtakes camera light and keeping the total light as 1
    } else if (totalLightSliderValue >= 1) {
        ambLtemp = sliderAmbientLighting.value;
        camLtemp = 1 - ambLtemp;
    }
    cameraLight.intensity = camLtemp;
    ambientLight.intensity = ambLtemp;

    // "room" color now depends on brightness
    // const roomBrightness = String((Math.round(Number(sliderAmbientLighting.value) * 255)).toString(16)).padStart(2, '0');
    // renderer.setClearColor(`#${roomBrightness}${roomBrightness}${roomBrightness}`, Math.abs(sliderAmbientLighting.value-1));

    lightCheckerboardCanvas.style.opacity = sliderAmbientLighting.value**2;
    const b = sliderCameraLighting.value * 64 + 20;
    document.body.style.backgroundImage = `radial-gradient(rgba(${b}, ${b}, ${b}), rgba(20, 20, 20, 1))`;
};
updateLightIntensity();

sliderCameraLighting.addEventListener('input', updateLightIntensity);
sliderAmbientLighting.addEventListener('input', updateLightIntensity);

// ================================= FUNCTIONS USABLE ON OTHER PROJECTS =============================================

function rectangularGridHelper(width, height, cols, rows, color) {
    const gridMaterial = new THREE.LineBasicMaterial({ color: color });
    const gridGeometry = new THREE.BufferGeometry();
    const vertices = [];

    const colStep = width / cols;
    const rowStep = height / rows;

    // Vertical lines
    for (let i = 0; i <= cols; i++) {
        const x = i * colStep - width / 2;
        vertices.push(x, 0, -height / 2);
        vertices.push(x, 0, height / 2);
    }

    // Horizontal lines
    for (let j = 0; j <= rows; j++) {
        const z = j * rowStep - height / 2;
        vertices.push(-width / 2, 0, z);
        vertices.push(width / 2, 0, z);
    }

    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
    return grid;
}

function pixelate(texture) { texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter; }

// ================================= FUNCTIONS YOU SHOULDN'T TOUCH ==================================================

// use it as   ->   correctUVMap(geometry, [canvas], [startingPointX, startingPointY]) = loadTextureViaCanvas("elementId");
function correctUVMap(geometry, [textureWidth, textureHeight], [offsetX, offsetYtemp]) {
    // giant ass code just to make threejs render cubes like how minecraft does
    const lng = geometry.parameters.width;
    const hgt = geometry.parameters.height;
    const wdh = geometry.parameters.depth;

    const pixelSizeWidth = 1/textureWidth * skinRes;
    const pixelSizeHeight = 1/textureHeight * skinRes;

    const offsetY = (textureHeight-offsetYtemp-wdh-hgt);

    const uvs = geometry.attributes.uv.array;

    // RIGHT SIDE (idk why right and left are always flipped in three js, or maybe that's just my error for being amateurish)
    const offsetRight = 1 * 4 * 2;  // since right side goes first
    uvs[offsetRight + 0] = ( 0   +offsetX) * pixelSizeWidth; /**/ uvs[offsetRight + 1] = (hgt  +offsetY) * pixelSizeHeight;  // Bottom Left Vertex
    uvs[offsetRight + 2] = (wdh  +offsetX) * pixelSizeWidth; /**/ uvs[offsetRight + 3] = (hgt  +offsetY) * pixelSizeHeight;  // Bottom Right Vertex
    uvs[offsetRight + 4] = ( 0   +offsetX) * pixelSizeWidth; /**/ uvs[offsetRight + 5] = ( 0   +offsetY) * pixelSizeWidth;   // Top Left Vertex
    uvs[offsetRight + 6] = (wdh  +offsetX) * pixelSizeWidth; /**/ uvs[offsetRight + 7] = ( 0   +offsetY) * pixelSizeWidth;   // Top Right Vertex

    // lEFT SIDE
    const offsetLeft = 0 * 4 * 2;
    uvs[offsetLeft + 0] = (wdh+lng      +offsetX) * pixelSizeWidth; /**/ uvs[offsetLeft + 1] = (hgt  +offsetY) * pixelSizeHeight;  // Bottom Left Vertex
    uvs[offsetLeft + 2] = (wdh+lng+wdh  +offsetX) * pixelSizeWidth; /**/ uvs[offsetLeft + 3] = (hgt  +offsetY) * pixelSizeHeight;  // Bottom Right Vertex
    uvs[offsetLeft + 4] = (wdh+lng      +offsetX) * pixelSizeWidth; /**/ uvs[offsetLeft + 5] = ( 0   +offsetY) * pixelSizeHeight;  // Top Left Vertex
    uvs[offsetLeft + 6] = (wdh+lng+wdh  +offsetX) * pixelSizeWidth; /**/ uvs[offsetLeft + 7] = ( 0   +offsetY) * pixelSizeHeight;  // Top Right Vertex

    // TOP SIDE
    const offsetTop = 2 * 4 * 2;
    uvs[offsetTop + 0] = (wdh      +offsetX) * pixelSizeWidth; /**/ uvs[offsetTop + 1] = (hgt+wdh  +offsetY) * pixelSizeHeight;  // Bottom Left Vertex
    uvs[offsetTop + 2] = (wdh+lng  +offsetX) * pixelSizeWidth; /**/ uvs[offsetTop + 3] = (hgt+wdh  +offsetY) * pixelSizeHeight;  // Bottom Right Vertex
    uvs[offsetTop + 4] = (wdh      +offsetX) * pixelSizeWidth; /**/ uvs[offsetTop + 5] = (hgt      +offsetY) * pixelSizeHeight;  // Top Left Vertex
    uvs[offsetTop + 6] = (wdh+lng  +offsetX) * pixelSizeWidth; /**/ uvs[offsetTop + 7] = (hgt      +offsetY) * pixelSizeHeight;  // Top Right Vertex

    // BOTTOM SIDE
    const offsetBottom = 3 * 4 * 2;
    uvs[offsetBottom + 0] = (wdh+lng      +offsetX) * pixelSizeWidth; /**/ uvs[offsetBottom + 1] = (hgt      +offsetY) * pixelSizeHeight;  // Bottom Left Vertex
    uvs[offsetBottom + 2] = (wdh+lng+lng  +offsetX) * pixelSizeWidth; /**/ uvs[offsetBottom + 3] = (hgt      +offsetY) * pixelSizeHeight;  // Bottom Right Vertex
    uvs[offsetBottom + 4] = (wdh+lng      +offsetX) * pixelSizeWidth; /**/ uvs[offsetBottom + 5] = (hgt+wdh  +offsetY) * pixelSizeHeight;  // Top Left Vertex
    uvs[offsetBottom + 6] = (wdh+lng+lng  +offsetX) * pixelSizeWidth; /**/ uvs[offsetBottom + 7] = (hgt+wdh  +offsetY) * pixelSizeHeight;  // Top Right Vertex

    // FRONT SIDE
    const offsetFront = 4 * 4 * 2;
    uvs[offsetFront + 0] = (wdh      +offsetX) * pixelSizeWidth; /**/ uvs[offsetFront + 1] = (hgt  +offsetY) * pixelSizeHeight;  // Bottom Left Vertex
    uvs[offsetFront + 2] = (wdh+lng  +offsetX) * pixelSizeWidth; /**/ uvs[offsetFront + 3] = (hgt  +offsetY) * pixelSizeHeight;  // Bottom Right Vertex
    uvs[offsetFront + 4] = (wdh      +offsetX) * pixelSizeWidth; /**/ uvs[offsetFront + 5] = ( 0   +offsetY) * pixelSizeHeight;  // Top Left Vertex
    uvs[offsetFront + 6] = (wdh+lng  +offsetX) * pixelSizeWidth; /**/ uvs[offsetFront + 7] = ( 0   +offsetY) * pixelSizeHeight;  // Top Right Vertex

    // BACK SIDE
    const offsetBack = 5 * 4 * 2;
    uvs[offsetBack + 0] = (wdh+lng+wdh      +offsetX) * pixelSizeWidth; /**/ uvs[offsetBack + 1] = (hgt  +offsetY) * pixelSizeHeight;  // Bottom Left Vertex
    uvs[offsetBack + 2] = (wdh+lng+wdh+lng  +offsetX) * pixelSizeWidth; /**/ uvs[offsetBack + 3] = (hgt  +offsetY) * pixelSizeHeight;  // Bottom Right Vertex
    uvs[offsetBack + 4] = (wdh+lng+wdh      +offsetX) * pixelSizeWidth; /**/ uvs[offsetBack + 5] = ( 0   +offsetY) * pixelSizeHeight;  // Top Left Vertex
    uvs[offsetBack + 6] = (wdh+lng+wdh+lng  +offsetX) * pixelSizeWidth; /**/ uvs[offsetBack + 7] = ( 0   +offsetY) * pixelSizeHeight;  // Top Right Vertex

    // ai told me I needed this to make the skin glow, and it actually did, wtf???
    geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

    // Inform Three.js that UVs were updated
    geometry.attributes.uv.needsUpdate = true;
}

// inflates a cube like how blockbench does it
function inflate(object, inflation) {
    const length = object.geometry.parameters.width;
    const height = object.geometry.parameters.height;
    const width = object.geometry.parameters.depth;

    object.scale.set(1 + ((1 / length) * (inflation * 2)), 1 + ((1 / height) * (inflation * 2)), 1 + ((1 / width) * (inflation * 2)));
}


// Turns an entire canvas into black, with the exception of fully transparent pixels
function turnNonTransparentPixelsBlack(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha !== 0) {
            // Change R, G, B to 0 (black)
            data[i] = 0;     // Red
            data[i + 1] = 0; // Green
            data[i + 2] = 0; // Blue
            // Preserve alpha channel
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function multiplyBlending(canvasMultiplier, canvasBase) {
    const ctxBase = canvasBase.getContext('2d');
    const ctxMultiplier = canvasMultiplier.getContext('2d');

    const baseImageData = ctxMultiplier.getImageData(0, 0, canvasBase.width, canvasBase.height);

    ctxBase.globalCompositeOperation = 'multiply';
    ctxBase.drawImage(canvasMultiplier, 0, 0);

    // Restore alpha
    const resultImageData = ctxBase.getImageData(0, 0, canvasBase.width, canvasBase.height);
    const data = resultImageData.data;
    const baseAlpha = baseImageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i + 3] = baseAlpha[i + 3]; // Restore alpha
    }

    ctxBase.putImageData(resultImageData, 0, 0);

    ctxBase.globalCompositeOperation = 'source-over';
}

function invertColor(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation='difference';
    ctx.fillStyle='white';
    ctx.fillRect(0, 0, canvas.width,canvas.height);
    ctx.globalCompositeOperation = 'source-over';
}

// ================================= PREPARING TEXTURES =============================================================

var skinRes = 1;  // my humble attempt at adding 128x skin support. After hours of trying, I conclude it's impossible. Sorry.

let originalSkin = document.getElementById("steveDefault");

const canvasOriginalSkin = document.createElement('canvas');
canvasOriginalSkin.width = 64 * skinRes; canvasOriginalSkin.height = 64 * skinRes;
const ctxOriginalSkin = canvasOriginalSkin.getContext("2d");
ctxOriginalSkin.drawImage(originalSkin, 0, 0);

const canvasEmissiveMap = document.createElement('canvas');
canvasEmissiveMap.width = 64 * skinRes; canvasEmissiveMap.height = 64 * skinRes;
const ctxEmissiveMap = canvasEmissiveMap.getContext("2d");
ctxEmissiveMap.fillStyle = "black";
ctxEmissiveMap.fillRect(0, 0, canvasEmissiveMap.width, canvasEmissiveMap.height);

function updateTextures() {
    computeTextures();

    // Dispose old textures to avoid memory leaks
    textureSkinBase.dispose();
    textureSkinGlow.dispose();

    textureSkinBase = new THREE.CanvasTexture(canvasGlowBase);
    pixelate(textureSkinBase);

    textureSkinGlow = new THREE.CanvasTexture(canvasGlowMap);
    pixelate(textureSkinGlow);

    materialGlobal.map = textureSkinBase;
    materialGlobal.emissiveMap = textureSkinGlow;
    materialGlobal.needsUpdate = true;
}

function handleImageUpload(file, ctx, width, height) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        updateTextures();
    };
}

// Original skin upload
const inputOrigSkin = document.getElementById("inputSkin");
inputOrigSkin.addEventListener("change", () => {
    const file = inputOrigSkin.files[0];
    if (file) {
        handleImageUpload(file, ctxOriginalSkin, canvasOriginalSkin.width, canvasOriginalSkin.height);
    }
});

// Emissive map upload
const inputEmissive = document.getElementById("inputEmissive");
inputEmissive.addEventListener("change", () => {
    const file = inputEmissive.files[0];
    if (file) {
        handleImageUpload(file, ctxEmissiveMap, canvasEmissiveMap.width, canvasEmissiveMap.height);
    }
});

// --------------------------------- making the glowmap ---------------------------------------------------
const canvasGlowMap = document.createElement('canvas');
canvasGlowMap.width = 64; canvasGlowMap.height = 64;
const ctxGlowMap = canvasGlowMap.getContext('2d');
// --------------------------------- making the glowbase --------------------------------------------------
const canvasGlowBase = document.createElement('canvas');
canvasGlowBase.width = 64; canvasGlowBase.height = 64;
const ctxGlowBase = canvasGlowBase.getContext('2d');

// refresh the textures every time a change in the texture happens
function computeTextures() {
    // --------------------------------- making the glowmap ---------------------------------------------------
    // (OS as multiply) -> (EM color.inverted) = SM
    ctxGlowMap.drawImage(canvasEmissiveMap, 0, 0);
    multiplyBlending(canvasOriginalSkin, canvasGlowMap);

    // --------------------------------- making the glowbase --------------------------------------------------
    // (OS as multiply) -> EM = SG
    ctxGlowBase.drawImage(canvasEmissiveMap, 0, 0);
    invertColor(canvasGlowBase);
    multiplyBlending(canvasOriginalSkin, canvasGlowBase);
}
computeTextures();

// ================================= CREATING OBJECTS TO BE USED IN SCENE ===========================================

function createGridFace([length, height], [xPos, yPos, zPos], [pitchAngle, rollAngle]) {
    const grid = rectangularGridHelper(length, height, length, height, 0x666666);
    grid.position.set(xPos, yPos, zPos);
    grid.rotation.set((Math.PI / 180) * pitchAngle, 0, (Math.PI / 180) * rollAngle);
    return grid;
}

function createGridCube(cube) {
    const length = cube.geometry.parameters.width;
    const height = cube.geometry.parameters.height;
    const width = cube.geometry.parameters.depth;
    const [inflationX, inflationY, inflationZ] = cube.scale;

    const gridGroup = new THREE.Group();

    const gridRight = createGridFace([height, width], [length / 2, 0, 0], [0, 90]);
    gridGroup.add(gridRight);

    const gridLeft = createGridFace([height, width], [-length / 2, 0, 0], [0, 90]);
    gridGroup.add(gridLeft);

    const gridTop = createGridFace([length, width], [0, height / 2, 0], [0, 0]);
    gridGroup.add(gridTop);

    const gridBottom = createGridFace([length, width], [0, -height / 2, 0], [0, 0]);
    gridGroup.add(gridBottom);

    const gridFront = createGridFace([length, height], [0, 0, width / 2], [90, 0]);
    gridGroup.add(gridFront);

    const gridBack = createGridFace([length, height], [0, 0, -width / 2], [90, 0]);
    gridGroup.add(gridBack);

    gridGroup.scale.set(inflationX + 0.005, inflationY + 0.005, inflationZ + 0.005);

    return gridGroup;
}

// This is just to make the code more nice to look at.
// Creates a cube and a grid
function createBodyPart([length, height, width], [UVLeft, UVTop], inflation) {
    const geometry = new THREE.BoxGeometry(length, height, width);
    // "64, 64" is a constant, since the skin size is always 64x64, unless it's actually 128x128 which I'll just deal with in the future
    correctUVMap(geometry, [64, 64], [UVLeft, UVTop]);
    // materialGlobal is a constant
    const mesh = new THREE.Mesh(geometry, materialGlobal);
    inflate(mesh, inflation);
    // generate grid for the cube
    const gridGroup = createGridCube(mesh);
    const meshGroup = new THREE.Group();
    meshGroup.add(mesh);
    meshGroup.add(gridGroup);
    // return meshGroup and gridGroup (since it needs to be toggleable later on) as two outputs. Though still not renderedto scene
    return [meshGroup, gridGroup];
}

// ================================= START OF OBJECT GENERATION =====================================================

const armMode = document.getElementById("armModeSelection");
armMode.value = "wide";

armMode.addEventListener('change', () => {
    // Check if a part is checked in the parts visibility checkboxes
    function isChecked(id) {
        const checkbox = document.getElementById(id);
        return checkbox ? checkbox.checked : false;
    }
    if (armMode.value === "wide") {
        // Show wide arms only if checkboxes are checked, hide thin arms
        groupArmRightWide.visible = isChecked('checkboxArmRight');
        groupArmLeftWide.visible = isChecked('checkboxArmLeft');
        groupArmRightThin.visible = false;
        groupArmLeftThin.visible = false;
        // Show wide sleeves only if checkboxes are checked, hide thin sleeves
        groupSleeveRightWide.visible = isChecked('checkboxSleeveRight');
        groupSleeveLeftWide.visible = isChecked('checkboxSleeveLeft');
        groupSleeveRightThin.visible = false;
        groupSleeveLeftThin.visible = false;
    } else if (armMode.value === "thin") {
        // Hide wide arms, show thin arms only if checkboxes are checked
        groupArmRightWide.visible = false;
        groupArmLeftWide.visible = false;
        groupArmRightThin.visible = isChecked('checkboxArmRight');
        groupArmLeftThin.visible = isChecked('checkboxArmLeft');
        // Hide wide sleeves, show thin sleeves only if checkboxes are checked
        groupSleeveRightWide.visible = false;
        groupSleeveLeftWide.visible = false;
        groupSleeveRightThin.visible = isChecked('checkboxSleeveRight');
        groupSleeveLeftThin.visible = isChecked('checkboxSleeveLeft');
    }
});


let textureSkinBase = new THREE.CanvasTexture(canvasGlowBase);
pixelate(textureSkinBase);
let textureSkinGlow = new THREE.CanvasTexture(canvasGlowMap);
pixelate(textureSkinGlow);

// this needs textureSkinBase and textureSkinGlow
const materialGlobal = new THREE.MeshStandardMaterial({  // DO NOT CHANGE/MODIFY THIS PART OF CODE
    map: textureSkinBase,
    transparent: true,
    emissiveMap: textureSkinGlow,
    emissive: new THREE.Color("white")
});

const [groupHead, gridHead] = createBodyPart([8, 8, 8], [0, 0], 0);
scene.add(groupHead);
groupHead.position.set(0, 12, 0);
groupHead.name = "groupHead";

const [groupBody, gridBody] = createBodyPart([8, 12, 4], [16, 16], 0);
scene.add(groupBody);
groupBody.position.set(0, 2, 0);
groupBody.name = "groupBody";

// Arms Wide
const [groupArmRightWide, gridArmRightWide] = createBodyPart([4, 12, 4], [40, 16], 0);
groupArmRightWide.position.set(-6, 2, 0);
scene.add(groupArmRightWide);
groupArmRightWide.name = "groupArmRightWide";

const [groupArmLeftWide, gridArmLeftWide] = createBodyPart([4, 12, 4], [32, 48], 0);
groupArmLeftWide.position.set(6, 2, 0);
scene.add(groupArmLeftWide);
groupArmLeftWide.name = "groupArmLeftWide";

// Arms Thin
const [groupArmRightThin, gridArmRightThin] = createBodyPart([3, 12, 4], [40, 16], 0);
groupArmRightThin.position.set(-5.5, 2, 0);
scene.add(groupArmRightThin);
groupArmRightThin.name = "groupArmRightThin";

const [groupArmLeftThin, gridArmLeftThin] = createBodyPart([3, 12, 4], [32, 48], 0);
groupArmLeftThin.position.set(5.5, 2, 0);
scene.add(groupArmLeftThin);
groupArmLeftThin.name = "groupArmLeftThin";

// Legs
const [groupLegRight, gridLegRight] = createBodyPart([4, 12, 4], [0, 16], 0);
groupLegRight.position.set(-2, -10, 0);
scene.add(groupLegRight);
groupLegRight.name = "groupLegRight";

const [groupLegLeft, gridLegLeft] = createBodyPart([4, 12, 4], [16, 48], 0);
groupLegLeft.position.set(2, -10, 0);
scene.add(groupLegLeft);
groupLegLeft.name = "groupLegLeft";

// Hat (with inflation 0.5)
const [groupHat, gridHat] = createBodyPart([8, 8, 8], [32, 0], 0.5);
groupHat.position.set(0, 12, 0);
scene.add(groupHat);
groupHat.name = "groupHat";

// Jacket (with inflation 0.25)
const [groupJacket, gridJacket] = createBodyPart([8, 12, 4], [16, 32], 0.25);
groupJacket.position.set(0, 2, 0);
scene.add(groupJacket);
groupJacket.name = "groupJacket";

// Sleeves Wide (with inflation 0.25)
const [groupSleeveRightWide, gridSleeveRightWide] = createBodyPart([4, 12, 4], [40, 32], 0.25);
groupSleeveRightWide.position.set(-6, 2, 0);
scene.add(groupSleeveRightWide);
groupSleeveRightWide.name = "groupSleeveRightWide";

const [groupSleeveLeftWide, gridSleeveLeftWide] = createBodyPart([4, 12, 4], [48, 48], 0.25);
groupSleeveLeftWide.position.set(6, 2, 0);
scene.add(groupSleeveLeftWide);
groupSleeveLeftWide.name = "groupSleeveLeftWide";

// Sleeves Thin (with inflation 0.25)
const [groupSleeveRightThin, gridSleeveRightThin] = createBodyPart([3, 12, 4], [40, 32], 0.25);
groupSleeveRightThin.position.set(-5.5, 2, 0);
scene.add(groupSleeveRightThin);
groupSleeveRightThin.name = "groupSleeveRightThin";

const [groupSleeveLeftThin, gridSleeveLeftThin] = createBodyPart([3, 12, 4], [48, 48], 0.25);
groupSleeveLeftThin.position.set(5.5, 2, 0);
scene.add(groupSleeveLeftThin);
groupSleeveLeftThin.name = "groupSleeveLeftThin";

// Pants (with inflation 0.25)
const [groupPantsRight, gridPantsRight] = createBodyPart([4, 12, 4], [0, 32], 0.25);
groupPantsRight.position.set(-2, -10, 0);
scene.add(groupPantsRight);
groupPantsRight.name = "groupPantsRight";

const [groupPantsLeft, gridPantsLeft] = createBodyPart([4, 12, 4], [0, 48], 0.25);
groupPantsLeft.position.set(2, -10, 0);
scene.add(groupPantsLeft);
groupPantsLeft.name = "groupPantsLeft";



// Reorders the rendering of the cubes to prevent covering each other and not rendering properly
groupHead.renderOrder = 0;
groupBody.renderOrder = 0;
groupArmRightWide.renderOrder = 0; groupArmLeftWide.renderOrder = 0;
groupArmRightThin.renderOrder = 0; groupArmLeftThin.renderOrder = 0;
groupLegRight.renderOrder = 0;
groupLegLeft.renderOrder = 0;

groupHat.renderOrder = 2;
groupJacket.renderOrder = 1;
groupSleeveRightWide.renderOrder = 2; groupSleeveLeftWide.renderOrder = 2;
groupSleeveRightThin.renderOrder = 2; groupSleeveLeftThin.renderOrder = 2;
groupPantsRight.renderOrder = 2;
groupPantsLeft.renderOrder = 2;


const checkboxGridInner = document.getElementById('checkboxGridInner');
const checkboxGridOuter = document.getElementById('checkboxGridOuter');

function gridPartsVisibility() {
    gridHead.visible = checkboxGridInner.checked;
    gridBody.visible = checkboxGridInner.checked;
    gridArmRightWide.visible = checkboxGridInner.checked; gridArmLeftWide.visible = checkboxGridInner.checked;
    gridArmRightThin.visible = checkboxGridInner.checked; gridArmLeftThin.visible = checkboxGridInner.checked;
    gridLegRight.visible = checkboxGridInner.checked;
    gridLegLeft.visible = checkboxGridInner.checked;

    gridHat.visible = checkboxGridOuter.checked;
    gridJacket.visible = checkboxGridOuter.checked;
    gridSleeveRightWide.visible = checkboxGridOuter.checked; gridSleeveLeftWide.visible = checkboxGridOuter.checked;
    gridSleeveRightThin.visible = checkboxGridOuter.checked; gridSleeveLeftThin.visible = checkboxGridOuter.checked;
    gridPantsRight.visible = checkboxGridOuter.checked;
    gridPantsLeft.visible = checkboxGridOuter.checked;
}
gridPartsVisibility();

checkboxGridInner.addEventListener('change', function () {
    if (checkboxGridInner.checked) gridPartsVisibility();
    else if (!checkboxGridInner.checked) gridPartsVisibility();
});

checkboxGridOuter.addEventListener('change', function () {
    if (checkboxGridOuter.checked) gridPartsVisibility();
    else if (!checkboxGridOuter.checked) gridPartsVisibility();
});

// my brain hurt too much thinking about this, so im so sorry but I used ai for this part. I just needed to fix a bug
// **************************************************************************************** \ \ \
const parts = [
    { checkboxId: 'checkboxHead', group: groupHead },
    { checkboxId: 'checkboxBody', group: groupBody },
    { checkboxId: 'checkboxArmRight', group: groupArmRightWide, variant: 'Wide' },
    { checkboxId: 'checkboxArmLeft', group: groupArmLeftWide, variant: 'Wide' },
    { checkboxId: 'checkboxArmRight', group: groupArmRightThin, variant: 'Thin' },
    { checkboxId: 'checkboxArmLeft', group: groupArmLeftThin, variant: 'Thin' },
    { checkboxId: 'checkboxLegRight', group: groupLegRight },
    { checkboxId: 'checkboxLegLeft', group: groupLegLeft },
    { checkboxId: 'checkboxHat', group: groupHat },
    { checkboxId: 'checkboxJacket', group: groupJacket },
    { checkboxId: 'checkboxSleeveRight', group: groupSleeveRightWide, variant: 'Wide' },
    { checkboxId: 'checkboxSleeveLeft', group: groupSleeveLeftWide, variant: 'Wide' },
    { checkboxId: 'checkboxSleeveRight', group: groupSleeveRightThin, variant: 'Thin' },
    { checkboxId: 'checkboxSleeveLeft', group: groupSleeveLeftThin, variant: 'Thin' },
    { checkboxId: 'checkboxPantsRight', group: groupPantsRight },
    { checkboxId: 'checkboxPantsLeft', group: groupPantsLeft }
];

// Function to update the visibility of a group based on checkbox and armMode
function updateVisibility(part) {
    const checkbox = document.getElementById(part.checkboxId);
    if (!checkbox) return;

    const armVariant = armMode.value; // "Wide" or "Thin" (match casing)
    if (!part.variant) {
        // No variant property, show/hide based only on checkbox
        part.group.visible = checkbox.checked;
    } else {
        // Has variant, show only if checkbox is checked AND variant matches armMode value
        part.group.visible = checkbox.checked && part.variant.toLowerCase() === armVariant.toLowerCase();
    }
}

// Initial visibility and add checkbox listeners
parts.forEach(part => {
    updateVisibility(part);

    const checkbox = document.getElementById(part.checkboxId);
    if (!checkbox) return;

    checkbox.addEventListener('change', () => {
        updateVisibility(part);
    });
});

// Update visibility when armMode changes
armMode.addEventListener('change', () => {
    parts.forEach(updateVisibility);
});
// **************************************************************************************** / / /

// ================================= MOUSE CONTROLS AND PAINTING ====================================================

const divSetLayersVisible = document.getElementById('layers');
divSetLayersVisible.addEventListener('change', findAllObjects);
armMode.addEventListener('change', findAllObjects);

let objectArray = [];
function findAllObjects() {
    objectArray = [];
    scene.traverseVisible(function (object) {
        if (object.isMesh) objectArray.push(object);
    });
}
findAllObjects();


// Add raycaster for detecting clicks on cube
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//  Detection for when the user is painting/moving, and activates isPainting and changes cursor style depending on the state
let isPainting = false;
let isMoving = false;

renderer.domElement.addEventListener('mousedown', (event) => {
    const rect = rendererCanvas.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objectArray);

    if (intersects.length > 0) {
        controls.enabled = false;
        paintAtEvent(event);
        isPainting = true;
        isMoving = false;
    } else {
        isPainting = false;
        isMoving = true;
    };
});

renderer.domElement.addEventListener('mousemove', (event) => {
    const rect = rendererCanvas.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objectArray);

    if (intersects.length > 0 && !isMoving) {
        rendererCanvas.style.cursor = "crosshair";
    }
    else {
        rendererCanvas.style.cursor = "move";
    };

    if (!isPainting) return;
    paintAtEvent(event);
});

renderer.domElement.addEventListener('mouseup', (event) => {
    controls.enabled = true;

    // clear actionHistoryFuture when you paint because uhh, obvious reasons
    if (isPainting) actionHistoryFuture = [];

    isPainting = false;
    isMoving = false;

    rendererCanvas.style.cursor = "move";
    // console.log("overallArray:", actionHistoryPast);

    doFilterArray();
});


function paintAtEvent(event) {
    const rect = rendererCanvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objectArray);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (intersect.uv) {
            paintOnTexture(intersect.uv);
        }
    }
}

function paintOnTexture(uv) {
    const x = Math.floor(uv.x * canvasEmissiveMap.width);
    const y = Math.floor((1 - uv.y) * canvasEmissiveMap.height);

    var p = ctxEmissiveMap.getImageData(x, y, 1, 1).data; 
    var red = p[0].toString(16).padStart(2, '0');
    var green = p[1].toString(16).padStart(2, '0');
    var blue = p[2].toString(16).padStart(2, '0');
    // var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    var hex = `#${red}${green}${blue}`;

    // where the brighter the pixel is, the brighter its emissiveness is.
    // only uses black & white since other colors tint it improperly.
    if (drawGlow) ctxEmissiveMap.fillStyle = "white";
    else ctxEmissiveMap.fillStyle = "black";
    
    ctxEmissiveMap.fillRect(x, y, 1, 1);
    ctxEmissiveMap.fillRect(x, y, 1, 1);

    // Recompute textures using the new changed emissive map
    computeTextures();

    textureSkinBase.needsUpdate = true;
    textureSkinGlow.needsUpdate = true;
    
    tempArray.push([x, y, ctxEmissiveMap.fillStyle, hex]);
}

// === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY ===
// === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY ===
// === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY ===
// === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY ===
// === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY ===
// === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY ===
// === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY ===
// === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY === LOGIC ON UNDO HISTORY ===

let tempArray = [];
let actionHistoryPast = [];
let actionHistoryFuture = [];  // I'll add functionality to this later

// ================================= BUTTONS ========================================================================

function doFilterArray() {
    const seen = new Set();
    let tempArray2 = tempArray.filter(subArray => {
        const key = subArray.slice(0, 3).join('|'); // Create a unique key using first 3 elements
        if (seen.has(key)) {
            return false; // Duplicate found, exclude
        } else {
            seen.add(key);
            return true; // Unique, include
        }
    });

    if (tempArray2.length > 0) {
        actionHistoryPast.push(tempArray2);  // add to main array
    }
    tempArray = [];   // clear the temporary arrays
    tempArray2 = [];
}


// undo button
function doUndo() {
    // prevents adding of undefined elements and breaking of the undo system
    if (actionHistoryPast[actionHistoryPast.length - 1] === undefined) {
        console.log("undo invalid");
        return;
    } else {
        // remove actionHistoryPast's last element and add it to actionHistoryFuture
        drawFromHistory("past");
        actionHistoryFuture.push(actionHistoryPast.pop());
    };
    updateAmountOfUndoRedo();
};
const undoBtn = document.getElementById('buttonUndo');
undoBtn.addEventListener('click', doUndo);
window.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        doUndo();
    }
})


// redo button
function doRedo() {
    // prevents adding of undefined elements and breaking of the redo system
    if (actionHistoryFuture[actionHistoryFuture.length - 1] === undefined) {
        console.log("redo invalid");
        return;
    } else {
        // remove actionHistoryFuture's last element and add it to actionHistoryPast
        drawFromHistory("future");
        actionHistoryPast.push(actionHistoryFuture.pop());
    };
    updateAmountOfUndoRedo();
};
const redoBtn = document.getElementById('buttonRedo');
redoBtn.addEventListener('click', doRedo);
window.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        doRedo();
    }
})


const numOfUndos = document.getElementById('numOfUndos');
const numOfRedos = document.getElementById('numOfRedos');

document.addEventListener('mouseup', updateAmountOfUndoRedo);

// Function for updating undo/redo (this function is only for visuals)
function updateAmountOfUndoRedo() {
    numOfUndos.innerHTML = actionHistoryPast.length;
    numOfRedos.innerHTML = actionHistoryFuture.length;
}


function drawFromHistory(mode) {
    if (mode === "past") {
        // console.log("draw the past");
        // console.log("actionHistoryPast:", actionHistoryPast);

        let latestHistory = actionHistoryPast[actionHistoryPast.length - 1];
        for (let i = 0; i < latestHistory.length; i++) {
            let pixelX = latestHistory[i][0];  // X coord of affected pixel
            let pixelY = latestHistory[i][1];  // Y coord of affected pixel
            let newColor = latestHistory[i][2];
            let oldColor = latestHistory[i][3];

            // fill all the new colors with the old color, essentially overwriting it
            ctxEmissiveMap.fillStyle = `${oldColor}`;
            ctxEmissiveMap.fillRect(pixelX, pixelY, 1, 1);

            // console.log(
            //     `pixel location: (${pixelX}, ${pixelY})` + '\n',
            //     `old: ${oldColor} -> new: ${newColor}`
            // );
        };
    } else if (mode === "future") {
        // console.log("draw the future");
        // console.log("actionHistoryFuture:", actionHistoryFuture);

        let latestFuture = actionHistoryFuture[actionHistoryFuture.length - 1];
        for (let i = 0; i < latestFuture.length; i++) {
            let pixelX = latestFuture[i][0];  // X coord of affected pixel
            let pixelY = latestFuture[i][1];  // Y coord of affected pixel
            let newColor = latestFuture[i][2];
            let oldColor = latestFuture[i][3];

            // fill all the old colors with the new color, essentially overwriting it
            ctxEmissiveMap.fillStyle = `${newColor}`;
            ctxEmissiveMap.fillRect(pixelX, pixelY, 1, 1);

            // console.log(
            //     `pixel location: (${pixelX}, ${pixelY})` + '\n',
            //     `new: ${newColor} -> old: ${oldColor}`
            // );
        };
    }

    // final step, which recomputes canvasEmissiveMap so it properly updates
    updateTextures();

};


// drawGlow/eraseGlow button toggles. Either you draw, or you erase.
let drawGlow = true;

// activate draw glow
function activateDraw() {
    drawGlow = true;
    buttonDrawGlow.classList.add('button-active');
    buttonEraseGlow.classList.remove('button-active');
}
const buttonDrawGlow = document.getElementById('buttonDrawGlow');
buttonDrawGlow.addEventListener('click', activateDraw);
window.addEventListener('keydown', function (e) {
    if (e.key === '1') {
        activateDraw();
    }
});

// activate erase glow
function activateErase() {
    drawGlow = false;
    buttonEraseGlow.classList.add('button-active');
    buttonDrawGlow.classList.remove('button-active');
}
const buttonEraseGlow = document.getElementById('buttonEraseGlow');
buttonEraseGlow.addEventListener('click', activateErase);
window.addEventListener('keydown', function (e) {
    if (e.key === '2') {
        activateErase();
    }
});

buttonDrawGlow.classList.add('button-active');
buttonEraseGlow.classList.remove('button-active');


const buttonResetEmissiveMap = document.getElementById('buttonResetEmissiveMap');
buttonResetEmissiveMap.addEventListener('click', function () {
    const proceed = confirm("Your current Emissive Map will be cleared. Continue?");
    if (proceed) {
        const ctx = canvasEmissiveMap.getContext('2d');
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvasEmissiveMap.width, canvasEmissiveMap.height);
        updateTextures();
    } else {
        return;
    }
})

// ================================= "animate()" ALWAYS AT THE END OF THE CODE ======================================

// let jaja = 0;
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    // jaja += 0.1;
    // groupHead.rotation.set(0,jaja,0);
    // camera light follows camera
    cameraLight.position.copy(camera.position);
}
animate();

// ================================= IMPORT DATA ====================================================================

window.sharedData = {canvas: canvasGlowMap};
