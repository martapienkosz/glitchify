import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { OrbitControls } from 'https://cdn.skypack.dev/@three-ts/orbit-controls';
import { GUI } from "https://cdn.skypack.dev/dat.gui";

// SOCKETS SETUP
let socket = io();

socket.on('connect', () => {
  console.log("client connected via sockets");
})



// SCENE SET UP
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antiAlias: true });
renderer.setClearColor(0x000000);
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);



// CAMERA + ORBIT CONTROLS SET UP
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000); // set camera properties
camera.position.z = 10;

window.OrbitControls = OrbitControls;
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update()



/// ADD VIDEO
const video = document.createElement('video')
const vidDiv = document.getElementById('video') 
video.setAttribute('width', 200);
video.setAttribute('height', 200);
video.autoplay = true
vidDiv.appendChild(video)



/// POSE NET SET UP
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(function(stream) {
  video.srcObject = stream;
})
  .catch(function(err) {
  console.log("An error occurred! " + err)
});

const options = {
  flipHorizontal: true,
  minConfidence: 0.5
}

const poseNet = ml5.poseNet(video, options, modelReady)



/// DETECT NOSE POSITION
let nose = {} // important to initialize an empty object which will store the x and y coordinates of your target body part
let estimatedNose;
poseNet.on('pose',  function(results) {
  let poses = results;
  loopThroughPoses(poses, nose)
    estimatedNose = {
      x: nose.x,
      y: nose.y
   }
});

function loopThroughPoses (poses, nose){
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      if (keypoint.score > 0.2 && keypoint.part === 'nose' ) {
         nose.x = keypoint.position.x
         nose.y = keypoint.position.y
       }
    }
  }
}

let model = false;
function modelReady() {
  console.log("model Loaded")
  model = true;
}



/// DETECT LEFTEYE POSITION
let leftEye = {} // important to initialize an empty object which will store the x and y coordinates of your target body part
let estimatedleftEye;
poseNet.on('pose',  function(results) {
  let poses = results;
  loopThroughPosesleftEye(poses, leftEye)
    estimatedleftEye = {
      x: leftEye.x,
      y: leftEye.y
   }
});

function loopThroughPosesleftEye (poses, leftEye){
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      if (keypoint.score > 0.2 && keypoint.part === 'leftEye' ) {
        leftEye.x = keypoint.position.x
        leftEye.y = keypoint.position.y
       }
    }
  }
}



/// DETECT RIGHTEYE POSITION
let rightEye = {} // important to initialize an empty object which will store the x and y coordinates of your target body part
let estimatedrightEye;
poseNet.on('pose',  function(results) {
  let poses = results;
  loopThroughPosesrightEye(poses, rightEye)
    estimatedrightEye = {
      x: rightEye.x,
      y: rightEye.y
   }
});

function loopThroughPosesrightEye (poses, rightEye){
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      if (keypoint.score > 0.2 && keypoint.part === 'rightEye' ) {
        rightEye.x = keypoint.position.x
        rightEye.y = keypoint.position.y
       }
    }
  }
}

let dist = rightEye.x - leftEye.x;


// CHANGE CAMERA POSITION FOR ALL USERS 
function updateColor() {
  let colorArray = [(estimatedNose.x/ 200), (estimatedNose.y/ 200), ((estimatedNose.y + estimatedNose.y)/ 400)]
  socket.emit('colorArray', colorArray); // emit data to server
}

socket.on("colorArrayFromServer", (data) => {
  mesh.material.color.r = data[0] // set up new cam pos based on data from server
  mesh.material.color.g = data[1]
  mesh.material.color.b = data[2]
})



// CHANGE CAMERA POSITION FOR ALL USERS 
function updateCamPos() {
  let camPos = [(5 + (-0.05) * estimatedNose.x), (-5 + ((0.05) *estimatedNose.y))]
  socket.emit('camPos', camPos); // emit data to server
}

socket.on("camPosFromServer", (data) => {
  camera.position.x = data[0] // set up new cam pos based on data from server
  camera.position.y = data[1]
})

function updateRotation() {
    // let dist = estimatedrightEye.x - estimatedrightEye.x;
    mesh.rotation.x += 0.02;
}



// INITIALIZE ARTWORK
const colors = [];
const numPoints = 100; // buffergeometry is a representation of mesh, line, or point geometry
const vertices = [];
const size = 10
const geometry = new THREE.BufferGeometry();
const material = new THREE.MeshBasicMaterial( {
    vertexColors: true,
    wireframe: true
  });

let r, g, b, x, y, z;

for (let i = 0; i< numPoints; i+=1) {
  x = Math.random() * size - size * 0.5, // sett position of verticles
  y = Math.random() * size - size * 0.5,
  z = Math.random() * size - size * 0.5,
  r = 1 // setting opacity of base color
  g = 1
  b = 1

  colors.push(r, g, b); // apend parameters
  vertices.push(x, y, z);
}


geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3)); // set up geometry, randomly generated triangles
geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3)); // set the color

const mesh = new THREE.Mesh(geometry, material) // initialize artwork


/// DRAWING THE ARTWORK
scene.add(mesh); // add artwork to the scene

function animate() {
  requestAnimationFrame(animate);
  updateColor();
  updateCamPos();
  updateRotation();
  renderer.render(scene, camera); // draw artwork
}

animate(); // update it