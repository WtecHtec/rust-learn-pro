// import ParticleAnimation from './particle/ParticleAnimation.js';
import ParticleAnimation from './wasm_particle/ParticleAnimation.js';

// 使用示例
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('animation-container');
  const particleAnimation = new ParticleAnimation(container);
  particleAnimation.start();
});
