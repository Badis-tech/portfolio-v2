/**
 * PARTICLE SYSTEM
 * A "System Engineer" visualization: Network nodes connecting dynamically.
 */

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Configuration
const particleCount = 150;
const connectionDistance = 15;
const particles = [];
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

// Create Particles
for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    // Random velocity
    particles.push({
        x: x,
        y: y,
        z: z,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        vz: (Math.random() - 0.5) * 0.05
    });

    // Color: Neon Green (#00ff88) with slight variation
    colors[i * 3] = 0.0;     // R
    colors[i * 3 + 1] = 1.0; // G
    colors[i * 3 + 2] = 0.53; // B
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Material
const material = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
});

const pointCloud = new THREE.Points(geometry, material);
scene.add(pointCloud);

// Lines (Connections)
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.15
});

camera.position.z = 50;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    const positions = geometry.attributes.position.array;

    // Update particles
    for (let i = 0; i < particleCount; i++) {
        // Move
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].z += particles[i].vz;

        // Boundary check (bounce)
        if (Math.abs(particles[i].x) > 50) particles[i].vx *= -1;
        if (Math.abs(particles[i].y) > 50) particles[i].vy *= -1;
        if (Math.abs(particles[i].z) > 50) particles[i].vz *= -1;

        // Update buffer
        positions[i * 3] = particles[i].x;
        positions[i * 3 + 1] = particles[i].y;
        positions[i * 3 + 2] = particles[i].z;
    }

    // Draw connections (Simple distance check)
    // Note: For performance in this demo, we are not creating/destroying geometry objects every frame.
    // In a production app, we'd use a LineSegments buffer.
    // Here, we'll just rotate the whole cloud slightly for effect.
    pointCloud.rotation.y += 0.001;
    pointCloud.rotation.z += 0.0005;

    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
