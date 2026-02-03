/**
 * THREE.JS PARTICLE SYSTEM
 * Visualizes a network of nodes (System Engineering theme).
 */
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const particleCount = 100;
    const particles = [];
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Get current accent color from CSS variables for dynamic coloring
    const computedStyle = getComputedStyle(document.body);
    const accentColor = computedStyle.getPropertyValue('--accent-color').trim();
    
    // Helper to parse hex color to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 1, b: 0.53 }; // Fallback to neon green
    }

    const rgb = hexToRgb(accentColor);

    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        particles.push({
            x: x, y: y, z: z,
            vx: (Math.random() - 0.5) * 0.05,
            vy: (Math.random() - 0.5) * 0.05,
            vz: (Math.random() - 0.5) * 0.05
        });

        colors[i * 3] = rgb.r;
        colors[i * 3 + 1] = rgb.g;
        colors[i * 3 + 2] = rgb.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    camera.position.z = 50;

    function animate() {
        requestAnimationFrame(animate);

        const positions = geometry.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
            particles[i].x += particles[i].vx;
            particles[i].y += particles[i].vy;
            particles[i].z += particles[i].vz;

            if (Math.abs(particles[i].x) > 50) particles[i].vx *= -1;
            if (Math.abs(particles[i].y) > 50) particles[i].vy *= -1;
            if (Math.abs(particles[i].z) > 50) particles[i].vz *= -1;

            positions[i * 3] = particles[i].x;
            positions[i * 3 + 1] = particles[i].y;
            positions[i * 3 + 2] = particles[i].z;
        }

        pointCloud.rotation.y += 0.001;
        pointCloud.rotation.z += 0.0005;

        geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

/**
 * THEME TOGGLE
 * Switches between Dark and Light mode.
 */
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const icon = toggle.querySelector('i');
    
    // Check local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        
        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
        
        // Re-init Three.js to pick up new colors (simple reload for now)
        // In a production app, we'd update the material colors dynamically.
        // For now, we'll just reload the page to apply the new particle colors cleanly.
        // location.reload(); // Optional: Reload to apply new colors to particles
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initThemeToggle();
});
