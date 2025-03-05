// 导入必要库
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import init, { ParticleSystem } from '../../pkg/particle_wasm.js';
import Stats from 'stats.js';
class ParticleAnimation {
  constructor() {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    document.body.appendChild(this.stats.dom);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.clock = new THREE.Clock();
    this.particleSystem = null;
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true,
      depthWrite: false
    });
    this.particleMesh = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.initScene();
    this.initParticleSystem();
    this.addEventListeners();
  }

  initScene() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 2, 5);
    this.controls.update();

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    this.scene.background = new THREE.Color(0x000011);
    this.scene.add(this.particleMesh);
  }

  async initParticleSystem() {
    await init();
    this.particleSystem = new ParticleSystem(25000000, 0, 0, 0);
    this.particleSystem.set_gravity(0.02);
    // this.animate();
  }

  updateParticles() {
    if (!this.particleSystem) return;

    const deltaTime = this.clock.getDelta();
    this.particleSystem.emit(50);
    this.particleSystem.update(deltaTime);

    const positions = this.particleSystem.get_particle_positions();
    const colors = this.particleSystem.get_particle_colors();
    const sizes = this.particleSystem.get_particle_sizes();

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));

    const particleSizeArray = new Float32Array(sizes);
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizeArray, 1));
  }

  animate() {
    this.stats.begin();
    requestAnimationFrame(() => this.animate());
    this.updateParticles();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this.stats.end();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects([new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial({ visible: false })
    )]);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      this.particleSystem.set_emitter_position(point.x, point.y, point.z);
    }
  }

  addEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
    document.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
  }
   // 启动动画
   start() {
        this.animate(); // 启动动画循环
    }
}

export default ParticleAnimation;