## May 12 | Final Project: Artify

### Roadtrip through unsucessful ideas

I must admit that I struggled a lot with coming up with an idea for this assignment. At first, I wanted to create a cute cozy coffeeshop in A-Frame and allow users to interact by making a clay object. I created a 3d model and tested socket connections.

![img](https://github.com/martapienkosz/connectionslab/edit/main/finalProject/dcmt/coffe.png)

Everything worked fine until I started to intensively add new "spheres", instances of the clay. Everything started to excessively lag. **Learnings**: Getting familiar with A-Frame!

![img](https://github.com/martapienkosz/connectionslab/edit/main/finalProject/dcmt/clay.png)

```
this.addMarker = function(e) {
  let p = e.detail.intersection.point;
  let scene = document.querySelector("a-scene");
  let newMark = document.createElement("a-entity");

  newMark.setAttribute("geometry", {
      primitive: "sphere",
  });

  newMark.setAttribute("material", "color: red");
  newMark.setAttribute("position", p);
  newMark.setAttribute("target-marker", {})
  scene.appendChild(newMark);
  
  this.el.addEventListener("click", this.addMarker)},
```

I decided to reevaluate my idea and create a city in VR that tells the story of its inhabitants. Before joining the link, users would be able share a story or gossip. For this purpose, I have explored the functionality of `rooms.db`. While in the city, users would be able to read other people's stories (by selecting the room with light turned on) or add their own story (by selecting the room with light turned off). I have added the [Gui library](https://rdub80.github.io/aframe-gui/) from A-Frame to allow this interaction and display text. After a while, however, I figured the typing feature would not work very well in VR, so the interaction would be lost somehow. **Learnings**: Getting familiar with Gui Library

Finally I have setttled on code generated art.

![img](https://github.com/martapienkosz/connectionslab/edit/main/finalProject/dcmt/aframe.png)


### Three.js

I have started off by exploring several of the [Three.js tutorials](https://www.youtube.com/watch?v=V4piptMZ_C4&t=93s). After setting up `sockets connection`, `scene` and `orbit controls` and getting somewhat familair I have created my main artwork. It utilizes [Buffer Geometry](https://threejs.org/docs/#api/en/core/BufferGeometry) which is better for GPU processing. It allowed me to prevent the problem I had encountered before.

```
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
```

![img](https://github.com/martapienkosz/connectionslab/edit/main/finalProject/dcmt/artwork.png)

Then I explored the `GUI elements` for changing various graphics parameters. I have set up sockets connection and emitted the camera position as well. Thanks to this, users were able to modify main artwork using the keyboard and mouse.

![img](https://github.com/martapienkosz/connectionslab/edit/main/finalProject/dcmt/gui.png)


```
const gui = new GUI(); 

const materialParams = {
  boxColor: mesh.material.color.getHex(), // display the color box reflecting the color of the artwork
};

gui
  .addColor(materialParams, "boxColor") // add box with colors to gui
  .onChange((value) => {
    socket.emit('colorValue', value)}); // emit colorValue to the server
    
socket.on('colorValueFromServer', (data)=> {
  mesh.material.color.set(data) // change color of the artwork for all
});
```

![img](https://github.com/martapienkosz/connectionslab/edit/main/finalProject/dcmt/scale.gif)

During the playtesting, one of my friends recommended me to check the `PoseNet` library and encouraged me to try to change the graphics parameters depending on the user's movement. I watched some [tutorials]((https://www.youtube.com/watch?v=OIo-DIOkNVg&t=601s)) and looked for [ways](https://annakap.medium.com/integrating-ml5-js-posenet-model-with-three-js-b19710e2862b) to integrate this library with `Three.js`.

After adding up a video element and setting up the `PoseNet models` (const poseNet = ml5.poseNet(video, options, modelReady)) I was able to dected the movemnt of my eyes, nose or wrists. I decided to change the position of the camera depending on the movement of the head. I also wanted the movement of the user's head to affect the color of the artwork.


```
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
```

![img](https://github.com/martapienkosz/connectionslab/edit/main/finalProject/dcmt/video.png)

Eventually I worked on emitting and receiving this data through the sockets.

Client side:

```
function updateCamPos() {
  let camPos = [(5 + (-0.05) * estimatedNose.x), ((0.05) *estimatedNose.y)]
  socket.emit('camPos', camPos);
}

socket.on("camPosFromServer", (data) => {
  camera.position.x = data[0];
  camera.position.y = data[1];
  console.log(camera.position.x, camera.position.y);
})
```

Server side:

```
socket.on("camPos", (data) => {
    console.log("got camPos: "+data);
    io.sockets.emit("camPosFromServer", data)
})
```


Cool!

![img](https://github.com/martapienkosz/connectionslab/edit/main/finalProject/dcmt/artsy.png)