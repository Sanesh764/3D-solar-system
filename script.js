// --- SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(0, 150, 400);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const labelsContainer = document.getElementById('labels-container');

// LIGHTS
const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2.5, 3000);
scene.add(pointLight);

// --- DATA ---
const planetData = {
  sun: {
    radius: 20, texture: createSunTexture(),
    description: "The Sun is the star at the center of the Solar System...",
    diameter: "1.39 million km", day: "25-35 Earth days", year: "N/A",
    temp: "5,500 °C", moons: "N/A", fact: "The Sun accounts for 99.86% of the mass in the solar system."
  },
  mercury: {
    radius: 1.5, distance: 50, speed: 0.04, color: 0xaaaaaa,
    description: "Mercury is the smallest planet and closest to the Sun...",
    diameter: "4,879 km", day: "58.6 Earth days", year: "88 Earth days",
    temp: "-173 to 427 °C", moons: "0", fact: "A year on Mercury is shorter than its day."
  },
  venus: {
    radius: 3.5, distance: 80, speed: 0.025, color: 0xffa500,
    description: "Venus has a thick atmosphere that traps heat...",
    diameter: "12,104 km", day: "243 Earth days", year: "225 Earth days",
    temp: "465 °C", moons: "0", fact: "Venus spins in the opposite direction from most planets."
  },
  earth: {
    radius: 4, distance: 120, speed: 0.015, color: 0x4682b4,
    description: "Earth is the only planet known to support life...",
    diameter: "12,742 km", day: "24 hours", year: "365.25 days",
    temp: "-88 to 58 °C", moons: "1", fact: "Earth is not named after a god."
  },
  mars: {
    radius: 2.5, distance: 160, speed: 0.01, color: 0xc1440e,
    description: "Mars is a cold, dusty desert world...",
    diameter: "6,779 km", day: "24.6 hours", year: "687 Earth days",
    temp: "-65 °C", moons: "2", fact: "Mars has the tallest volcano in the solar system."
  },
  jupiter: {
    radius: 12, distance: 220, speed: 0.005, color: 0xd2b48c,
    description: "Jupiter is the largest planet in the solar system...",
    diameter: "139,820 km", day: "9.9 hours", year: "11.9 Earth years",
    temp: "-145 °C", moons: "95", fact: "The Great Red Spot is a storm larger than Earth."
  },
  saturn: {
    radius: 10, distance: 300, speed: 0.003, color: 0xf0e68c,
    description: "Saturn is known for its beautiful ring system...",
    diameter: "116,460 km", day: "10.7 hours", year: "29.5 Earth years",
    temp: "-178 °C", moons: "146", fact: "Saturn could float in water due to its low density."
  },
  uranus: {
    radius: 7, distance: 380, speed: 0.002, color: 0xadd8e6,
    description: "Uranus rotates on its side, unlike any other planet...",
    diameter: "50,724 km", day: "17.2 hours", year: "84 Earth years",
    temp: "-224 °C", moons: "27", fact: "Uranus has 13 faint rings."
  },
  neptune: {
    radius: 6.5, distance: 450, speed: 0.001, color: 0x4169e1,
    description: "Neptune is a cold, dark planet with supersonic winds...",
    diameter: "49,244 km", day: "16.1 hours", year: "164.8 Earth years",
    temp: "-214 °C", moons: "14", fact: "Neptune was the first planet found by mathematical prediction."
  }
};


const celestialObjects = [];
const planetMeshes = [];
let focusedObject = null;

// --- CREATE SUN ---
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(planetData.sun.radius, 64, 64),
  new THREE.MeshBasicMaterial({ map: planetData.sun.texture })
);
sun.name = "Sun";
sun.userData = planetData.sun;
scene.add(sun);
planetMeshes.push(sun);

const sunLabel = createLabel("Sun");
labelsContainer.appendChild(sunLabel);
celestialObjects.push({ mesh: sun, label: sunLabel });

// --- CREATE PLANETS ---
Object.entries(planetData).forEach(([name, data]) => {
  if (name === 'sun') return;
  const planetPivot = new THREE.Object3D();
  scene.add(planetPivot);

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(data.radius, 32, 32),
    new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.8 })
  );
  planet.position.x = data.distance;
  planet.name = name.charAt(0).toUpperCase() + name.slice(1);
  planet.userData = data;
  planetPivot.add(planet);

  planetMeshes.push(planet);

  const label = createLabel(planet.name);
  labelsContainer.appendChild(label);

  celestialObjects.push({ mesh: planet, pivot: planetPivot, speed: data.speed, label });

  const orbit = new THREE.Mesh(
    new THREE.RingGeometry(data.distance - 0.2, data.distance + 0.2, 128),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, opacity: 0.1, transparent: true })
  );
  orbit.rotation.x = -Math.PI / 2;
  scene.add(orbit);
});

// --- STARFIELD ---
function createStarfield() {
  const stars = new THREE.BufferGeometry();
  const vertices = Array.from({ length: 15000 }, () => THREE.MathUtils.randFloatSpread(3000));
  stars.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 });
  scene.add(new THREE.Points(stars, starMaterial));
}
createStarfield();

function createLabel(text) {
  const div = document.createElement('div');
  div.className = 'label';
  div.textContent = text;
  return div;
}

function createSunTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 255, 180, 1)');
  grad.addColorStop(0.4, 'rgba(255, 200, 0, 1)');
  grad.addColorStop(1, 'rgba(255, 100, 0, 0.5)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

// --- MOUSE CONTROLS ---
let isMouseDown = false, isRightMouseDown = false;
let prevX = 0, prevY = 0;
const cameraTarget = new THREE.Vector3(0, 0, 0);

renderer.domElement.addEventListener('mousedown', e => {
  if (e.button === 0) { isMouseDown = true; document.body.classList.add('grabbing'); }
  if (e.button === 2) { isRightMouseDown = true; }
  prevX = e.clientX; prevY = e.clientY;
});
renderer.domElement.addEventListener('mouseup', e => {
  if (e.button === 0) { isMouseDown = false; document.body.classList.remove('grabbing'); }
  if (e.button === 2) { isRightMouseDown = false; }
});
renderer.domElement.addEventListener('mousemove', e => {
  const dx = e.clientX - prevX;
  const dy = e.clientY - prevY;
  if (isMouseDown) {
    const vec = new THREE.Vector3().subVectors(camera.position, cameraTarget);
    const phi = Math.atan2(vec.z, vec.x);
    const theta = Math.acos(vec.y / vec.length());
    const newPhi = phi - dx * 0.005;
    const newTheta = Math.max(0.1, Math.min(Math.PI - 0.1, theta - dy * 0.005));
    vec.x = vec.length() * Math.sin(newTheta) * Math.cos(newPhi);
    vec.z = vec.length() * Math.sin(newTheta) * Math.sin(newPhi);
    vec.y = vec.length() * Math.cos(newTheta);
    camera.position.copy(cameraTarget).add(vec);
  }
  if (isRightMouseDown) {
    const right = new THREE.Vector3().crossVectors(camera.up, camera.position.clone().sub(cameraTarget)).normalize();
    const up = new THREE.Vector3().crossVectors(camera.position.clone().sub(cameraTarget), right).normalize();
    const pan = right.multiplyScalar(-dx * 0.5).add(up.multiplyScalar(dy * 0.5));
    camera.position.add(pan); cameraTarget.add(pan);
  }
  prevX = e.clientX; prevY = e.clientY;
});
renderer.domElement.addEventListener('wheel', e => {
  const zoomSpeed = 0.1;
  const dir = camera.position.clone().sub(cameraTarget).normalize();
  const dist = camera.position.distanceTo(cameraTarget);
  const newDist = dist * (1 + (e.deltaY > 0 ? zoomSpeed : -zoomSpeed));
  camera.position.copy(cameraTarget).add(dir.multiplyScalar(Math.max(30, Math.min(1500, newDist))));
});
renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

// --- RAYCASTER CLICK INFO PANEL ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const infoPanel = document.getElementById('info-panel');

window.addEventListener('click', event => {
  if (infoPanel.contains(event.target)) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planetMeshes);
  if (intersects.length > 0) {
    focusedObject = intersects[0].object;
    const data = focusedObject.userData;
    document.getElementById('planet-name').innerText = focusedObject.name;
    document.getElementById('planet-description').innerText = data.description;
    document.getElementById('planet-diameter').innerText = data.diameter;
    document.getElementById('planet-day').innerText = data.day;
    document.getElementById('planet-year').innerText = data.year;
    document.getElementById('planet-temp').innerText = data.temp;
    document.getElementById('planet-moons').innerText = data.moons;
    document.getElementById('planet-fact').innerText = data.fact;
    infoPanel.style.display = 'block';
  }
});

document.getElementById('close-btn').addEventListener('click', () => {
  infoPanel.style.display = 'none';
  focusedObject = null;
});
document.getElementById('focus-btn').addEventListener('click', () => {
  if (focusedObject) {
    cameraTarget.copy(focusedObject.getWorldPosition(new THREE.Vector3()));
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- RESET / PAUSE ---
function resetView() {
  focusedObject = null;
  camera.position.set(0, 150, 400);
  cameraTarget.set(0, 0, 0);
}
let isPaused = false;
function toggleAnimation() {
  isPaused = !isPaused;
}

// --- ANIMATE ---
const clock = new THREE.Clock();
const positionVector = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (!isPaused) {
    celestialObjects.forEach(obj => {
      if (obj.pivot) obj.pivot.rotation.y += obj.speed * delta * 10;
      obj.mesh.rotation.y += 0.5 * delta;

      if (obj.label) {
        obj.mesh.getWorldPosition(positionVector);
        positionVector.project(camera);
        const x = (positionVector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
        const y = (positionVector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
        if (positionVector.z < 1) {
          obj.label.style.display = 'block';
          obj.label.style.left = `${x}px`;
          obj.label.style.top = `${y}px`;
        } else {
          obj.label.style.display = 'none';
        }
      }
    });
    if (focusedObject) {
      const target = new THREE.Vector3();
      focusedObject.getWorldPosition(target);
      cameraTarget.lerp(target, 0.1);
    } else {
      cameraTarget.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }
  }
  camera.lookAt(cameraTarget);
  renderer.render(scene, camera);
}
animate();
