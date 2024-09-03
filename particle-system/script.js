const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const maxParticles = 100;
const maxDist = 100;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let isMouseDown = false; // Track mouse button state

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function createParticle() {
    return {
        x: random(0, canvas.width),
        y: random(0, canvas.height),
        size: random(2, 4),
        speedX: random(-0.5, 0.5),
        speedY: random(-0.5, 0.5),
        color: `rgba(255, 255, 255, ${random(0.5, 1)})`,
        attached: false // Track if particle is attached to the mouse
    };
}

for (let i = 0; i < maxParticles; i++) {
    particles.push(createParticle());
}

function updateParticles() {
    particles.forEach(p => {
        if (p.attached) {
            // If the particle is attached to the mouse, set its position to mouse position
            p.x = mouseX;
            p.y = mouseY;
        } else {
            // Update particle position
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap particles around the edges of the screen
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            // Compute distance to mouse
            const distX = p.x - mouseX;
            const distY = p.y - mouseY;
            const distance = Math.hypot(distX, distY);

            // Apply repulsion force if within maxDist
            if (distance < maxDist && !isMouseDown) {
                const force = (maxDist - distance) / maxDist; // Force inversely proportional to distance
                const angle = Math.atan2(distY, distX);
                p.speedX += force * Math.cos(angle) * 0.1;
                p.speedY += force * Math.sin(angle) * 0.1;
            }
        }
    });
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach(other => {
            if (p !== other) {
                const dist = Math.hypot(p.x - other.x, p.y - other.y);
                if (dist < maxDist) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / maxDist})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            }
        });
    });
}

function animate() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    // Update particle attachment based on mouse position
    if (isMouseDown) {
        particles.forEach(p => {
            const distX = p.x - mouseX;
            const distY = p.y - mouseY;
            const distance = Math.hypot(distX, distY);
            if (distance < p.size) {
                p.attached = true;
            }
        });
    } else {
        particles.forEach(p => {
            p.attached = false;
        });
    }
});

window.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Left mouse button
        isMouseDown = true;
    }
});

window.addEventListener('mouseup', (event) => {
    if (event.button === 0) { // Left mouse button
        isMouseDown = false;
    }
});