class ParticleSystem {
    constructor(options = {}) {
        // 系统配置
        this.config = {
            maxParticles: options.maxParticles || 1000,
            emitterPosition: options.emitterPosition || { x: 0, y: 0, z: 0 },
            gravity: options.gravity || 0.005,
            spread: options.spread || 0.5,
            particleLifespan: options.particleLifespan || { min: 2, max: 4 },
            particleSize: options.particleSize || { min: 0.05, max: 0.35 },
            emitRate: options.emitRate || 20
        };

        // 粒子存储
        this.particles = [];

        // 性能优化：预分配内存
        this.particlePool = new Array(this.config.maxParticles).fill(null).map(() => this.createParticleTemplate());
    }

    // 创建粒子模板
    createParticleTemplate() {
        return {
            x: 0, y: 0, z: 0,  // 位置
            vx: 0, vy: 0, vz: 0,  // 速度
            life: 0,  // 生命周期
            maxLife: 0,  // 最大生命周期
            size: 0,  // 粒子大小
            color: { r: 1, g: 0.3, b: 0, a: 1 }  // 颜色
        };
    }

    // 随机数生成工具
    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // 设置发射器位置
    setEmitterPosition(x, y, z) {
        this.config.emitterPosition = { x, y, z };
    }

    // 发射粒子
    emit(count = this.config.emitRate) {
        const { emitterPosition: pos, spread, particleLifespan, particleSize } = this.config;

        for (let i = 0; i < count; i++) {
            // 如果达到最大粒子数，停止发射
            if (this.particles.length >= this.config.maxParticles) break;

            // 从对象池获取粒子
            const particle = this.particlePool.pop() || this.createParticleTemplate();

            // 重置粒子属性
            particle.x = pos.x;
            particle.y = pos.y;
            particle.z = pos.z;

            // 随机初始速度
            particle.vx = this.random(-spread, spread);
            particle.vy = this.random(0.2, 0.7);  // 向上运动
            particle.vz = this.random(-spread, spread);

            // 生命周期
            particle.life = 0;
            particle.maxLife = this.random(particleLifespan.min, particleLifespan.max);

            // 粒子大小
            particle.size = this.random(particleSize.min, particleSize.max);

            // 颜色动态变化
            particle.color = {
                r: 1,
                g: 0.3,
                b: 0,
                a: 1
            };

            this.particles.push(particle);
        }
    }

    // 更新粒子系统
    update(deltaTime = 0.016) {  // 默认帧率约60fps
        const { gravity } = this.config;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.z += particle.vz;

            // 应用重力
            particle.vy -= gravity;

            // 更新生命周期
            particle.life += deltaTime;

            // 更新颜色（从红色渐变到蓝色）
            const lifeProgress = particle.life / particle.maxLife;
            particle.color.r = 1 - lifeProgress;
            particle.color.b = lifeProgress;
            particle.color.a = 1 - lifeProgress;

            // 检查粒子是否死亡
            if (particle.life >= particle.maxLife) {
                // 将死亡粒子放回对象池
                this.particlePool.push(particle);
                this.particles.splice(i, 1);
            }
        }
    }

    // 获取所有粒子的位置数据
    getParticlePositions() {
        const positions = new Float32Array(this.particles.length * 3);
        this.particles.forEach((particle, index) => {
            positions[index * 3] = particle.x;
            positions[index * 3 + 1] = particle.y;
            positions[index * 3 + 2] = particle.z;
        });
        return positions;
    }

    // 获取所有粒子的大小数据
    getParticleSizes() {
        const sizes = new Float32Array(this.particles.length);
        this.particles.forEach((particle, index) => {
            const lifeProgress = particle.life / particle.maxLife;
            sizes[index] = particle.size * (1 - lifeProgress);
        });
        return sizes;
    }

    // 获取所有粒子的颜色数据
    getParticleColors() {
        const colors = new Float32Array(this.particles.length * 4);
        this.particles.forEach((particle, index) => {
            colors[index * 4] = particle.color.r;
            colors[index * 4 + 1] = particle.color.g;
            colors[index * 4 + 2] = particle.color.b;
            colors[index * 4 + 3] = particle.color.a;
        });
        return colors;
    }

    // 获取当前粒子数量
    getParticleCount() {
        return this.particles.length;
    }
}

// 导出供外部使用
export default ParticleSystem;