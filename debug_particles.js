// Particle Debug Script
// Run this in the browser console to check particle settings

console.log('=== PARTICLE DEBUG INFORMATION ===');

// Check localStorage values
console.log('LocalStorage Settings:');
console.log('particlesEnabled:', localStorage.getItem('particlesEnabled'));
console.log('particleCount:', localStorage.getItem('particleCount'));
console.log('connectionDistance:', localStorage.getItem('connectionDistance'));
console.log('maxConnections:', localStorage.getItem('maxConnections'));

// Check screen size
console.log('\nScreen Information:');
console.log('Window width:', window.innerWidth);
console.log('Window height:', window.innerHeight);
console.log('Mobile breakpoint (480px):', window.innerWidth <= 480 ? 'YES - PARTICLES DISABLED' : 'NO');

// Check for particle elements
console.log('\nDOM Elements:');
const particleCanvas = document.querySelector('.particle-background');
const floatingElements = document.querySelector('.floating-elements');
console.log('Particle canvas found:', !!particleCanvas);
console.log('Floating elements found:', !!floatingElements);

if (particleCanvas) {
    console.log('Canvas dimensions:', particleCanvas.width, 'x', particleCanvas.height);
    console.log('Canvas style:', window.getComputedStyle(particleCanvas).display);
}

if (floatingElements) {
    console.log('Floating elements style:', window.getComputedStyle(floatingElements).display);
    console.log('Floating elements count:', floatingElements.children.length);
}

// Check for game selection
console.log('\nGame State:');
const gameOverlay = document.querySelector('.game-view-overlay');
console.log('Game selected:', !!gameOverlay);

// Force enable particles if they're disabled
console.log('\n=== FIXING PARTICLES ===');
if (localStorage.getItem('particlesEnabled') !== 'true') {
    localStorage.setItem('particlesEnabled', 'true');
    console.log('✅ Enabled particles in localStorage');
}

// Set good default values
localStorage.setItem('particleCount', '45');
localStorage.setItem('connectionDistance', '170');
localStorage.setItem('maxConnections', '20');
console.log('✅ Reset particle settings to defaults');
console.log('Please refresh the page to see changes');
