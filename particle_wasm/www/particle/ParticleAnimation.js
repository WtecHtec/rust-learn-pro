import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ParticleSystem from './ParticleSystem.js';
import Stats from 'stats.js';

class ParticleAnimation {
    constructor(container) {
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb
        document.body.appendChild(this.stats.dom);
        // 场景初始化
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        // 设置渲染器
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        console.log(container)
        container.appendChild(this.renderer.domElement);

        // 摄像机位置
        this.camera.position.set(0, 2, 5);

        // 添加控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        // 灯光
        const ambientLight = new THREE.AmbientLight(0x404040);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        
        this.scene.add(ambientLight, directionalLight);
        this.scene.background = new THREE.Color(0x000011);

        // 创建粒子系统
        this.particleSystem = new ParticleSystem({
            maxParticles: 25000000,
            emitterPosition: { x: 0, y: 0, z: 0 },
            gravity: 0.02,
            spread: 0.5,
            emitRate: 50
        });

        // 创建粒子几何体
        this.particleGeometry = new THREE.BufferGeometry();
        this.particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });

        this.particleMesh = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.scene.add(this.particleMesh);

        // 动画循环
        this.animate = this.animate.bind(this);
        this.setupInteractions();
    }

    // 动画循环
    animate() {
         // 开始性能统计
         this.stats.begin();
        requestAnimationFrame(this.animate);

        // 更新粒子系统
        this.particleSystem.emit();
        this.particleSystem.update();

        // 更新几何体属性
        this.particleGeometry.setAttribute(
            'position', 
            new THREE.BufferAttribute(this.particleSystem.getParticlePositions(), 3)
        );
        this.particleGeometry.setAttribute(
            'color', 
            new THREE.BufferAttribute(this.particleSystem.getParticleColors(), 4)
        );
        this.particleGeometry.setAttribute(
            'size', 
            new THREE.BufferAttribute(this.particleSystem.getParticleSizes(), 1)
        );

        // 标记几何体需要更新
        this.particleGeometry.attributes.position.needsUpdate = true;
        this.particleGeometry.attributes.color.needsUpdate = true;
        this.particleGeometry.attributes.size.needsUpdate = true;

        // 渲染场景
        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        // 结束性能统计
        this.stats.end();
    }

    // 鼠标交互
    setupInteractions() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseMove = (event) => {
            // 标准化鼠标坐标
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // 将鼠标坐标转换为3D空间坐标
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects([
                new THREE.Mesh(
                    new THREE.PlaneGeometry(100, 100), 
                    new THREE.MeshBasicMaterial({ visible: false })
                )
            ]);

            if (intersects.length > 0) {
                const point = intersects[0].point;
                this.particleSystem.setEmitterPosition(point.x, point.y, point.z);
            }
        };

        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    // 窗口大小调整
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 启动动画
    start() {
        this.animate();
    }
}


export default ParticleAnimation;