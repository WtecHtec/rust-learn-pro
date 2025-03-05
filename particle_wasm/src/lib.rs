use wasm_bindgen::prelude::*;
use rand::prelude::*;
use serde::{Serialize, Deserialize};
use js_sys::{Math, Array, Float32Array};

// 定义粒子结构
#[derive(Serialize, Deserialize, Clone)]
pub struct Particle {
    x: f32,
    y: f32,
    z: f32,
    vx: f32,
    vy: f32,
    vz: f32,
    life: f32,
    max_life: f32,
    size: f32,
}

// 粒子系统
#[wasm_bindgen]
pub struct ParticleSystem {
    particles: Vec<Particle>,
    max_particles: usize,
    emitter_x: f32,
    emitter_y: f32,
    emitter_z: f32,
    gravity: f32,
    rng: ThreadRng,
}

// 实用随机数生成函数
fn random_range(rng: &mut ThreadRng, min: f32, max: f32) -> f32 {
    rng.r#gen::<f32>() * (max - min) + min
}

#[wasm_bindgen]
impl ParticleSystem {
    // 创建新的粒子系统
    #[wasm_bindgen(constructor)]
    pub fn new(max_particles: usize, emitter_x: f32, emitter_y: f32, emitter_z: f32) -> ParticleSystem {
        ParticleSystem {
            particles: Vec::with_capacity(max_particles),
            max_particles,
            emitter_x,
            emitter_y,
            emitter_z,
            gravity: 0.05,
            rng: rand::thread_rng(),
        }
    }
    
    // 设置发射器位置
    #[wasm_bindgen]
    pub fn set_emitter_position(&mut self, x: f32, y: f32, z: f32) {
        self.emitter_x = x;
        self.emitter_y = y;
        self.emitter_z = z;
    }
    
    // 设置重力
    #[wasm_bindgen]
    pub fn set_gravity(&mut self, gravity: f32) {
        self.gravity = gravity;
    }
    
    // 添加新粒子
    #[wasm_bindgen]
    pub fn emit(&mut self, count: usize) {
        for _ in 0..count {
            if self.particles.len() >= self.max_particles {
                break;
            }
            
            let spread = 0.5;
            let particle = Particle {
                x: self.emitter_x,
                y: self.emitter_y,
                z: self.emitter_z,
                // 使用显式的随机数生成函数
                vx: random_range(&mut self.rng, -spread, spread),
                vy: random_range(&mut self.rng, 0.2, 0.7), // 确保向上运动
                vz: random_range(&mut self.rng, -spread, spread),
                life: 0.0, // 从0开始生命周期
                max_life: random_range(&mut self.rng, 2.0, 4.0),
                size: random_range(&mut self.rng, 0.05, 0.35), // 更精细的尺寸控制
            };
            
            self.particles.push(particle);
        }
    }
    
    // 更新粒子系统
    #[wasm_bindgen]
    pub fn update(&mut self, delta_time: f32) {
        let mut i = 0;
        while i < self.particles.len() {
            let particle = &mut self.particles[i];
            
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.z += particle.vz;
            
            // 应用重力
            particle.vy -= self.gravity;
            
            // 更新生命值
            particle.life += delta_time;
            
            // 移除死亡粒子
            if particle.life >= particle.max_life {
                self.particles.swap_remove(i);
            } else {
                i += 1;
            }
        }
    }
    
    // 获取粒子位置数据，用于Three.js渲染
    #[wasm_bindgen]
    pub fn get_particle_positions(&self) -> Float32Array {
        let positions: Vec<f32> = self.particles.iter()
            .flat_map(|p| vec![p.x, p.y, p.z])
            .collect();
        
        Float32Array::from(&positions[..])
    }
    
    // 获取粒子大小数据
    #[wasm_bindgen]
    pub fn get_particle_sizes(&self) -> Float32Array {
        let sizes: Vec<f32> = self.particles.iter()
            .map(|particle| {
                // 生命周期结束时粒子逐渐缩小
                let life_progress = particle.life / particle.max_life;
                particle.size * (1.0 - life_progress)
            })
            .collect();
        
        Float32Array::from(&sizes[..])
    }
    
    // 获取粒子颜色数据
    #[wasm_bindgen]
    pub fn get_particle_colors(&self) -> Float32Array {
        let colors: Vec<f32> = self.particles.iter()
            .flat_map(|particle| {
                // 基于生命周期的颜色变化
                let life_progress = particle.life / particle.max_life;
                vec![
                    1.0 - life_progress,  // R
                    0.3,                  // G
                    life_progress,        // B
                    1.0 - life_progress   // Alpha
                ]
            })
            .collect();
        
        Float32Array::from(&colors[..])
    }
    
    // 获取当前粒子数量
    #[wasm_bindgen]
    pub fn get_particle_count(&self) -> usize {
        self.particles.len()
    }
}