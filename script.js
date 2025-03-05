let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;
let mouseTimeout;
let lastMouseX;
let lastMouseY;
let holdDuration = 0;
let holdInterval;
let holdTimer = null;
let growthInterval = null;
let currentBlob = null;
let currentScale = 0.1;
const GROWTH_RATE = 0.1;
const GROWTH_INTERVAL = 50; // How often to increase size (in ms)
const MAX_SCALE = 3.0; // Maximum size multiplier
let isHolding = false;
let blobInterval = null;
let mouseDownTime = 0;
const HOLD_DELAY = 100; // 100ms delay before blobs start appearing

const space = document.getElementById("infinite-space");
// const title = document.getElementById("title");

// Make the space much larger (100,000 x 100,000 pixels)
space.style.width = "100000px";
space.style.height = "100000px";

// Calculate the center position
const centerX = -50000;
const centerY = -50000;

// Initialize at center
space.style.transform = `translate(${centerX}px, ${centerY}px)`;
xOffset = centerX;
yOffset = centerY;

// More vibrant and saturated colors
const colors = [
    'rgba(255, 0, 128, 0.8)',    // Hot pink
    'rgba(0, 255, 255, 0.8)',    // Cyan
    'rgba(128, 0, 255, 0.8)',    // Purple
    'rgba(0, 255, 128, 0.8)',    // Neon green
    
    'rgba(255, 128, 0, 0.8)',    // Orange
    'rgba(255, 0, 255, 0.8)',    // Magenta
    'rgba(0, 128, 255, 0.8)'     // Blue
];

// Color palettes for different moods
const colorPalettes = {
    neon: [
        'rgba(255, 0, 128, 0.8)',
        'rgba(0, 255, 255, 0.8)',
        'rgba(255, 255, 0, 0.8)',
        'rgba(0, 255, 128, 0.8)'
    ],
    sunset: [
        'rgba(255, 128, 0, 0.8)',
        'rgba(255, 0, 128, 0.8)',
        'rgba(128, 0, 255, 0.8)',
        'rgba(255, 64, 64, 0.8)'
    ],
    ocean: [
        'rgba(0, 128, 255, 0.8)',
        'rgba(0, 255, 255, 0.8)',
        'rgba(0, 255, 128, 0.8)',
        'rgba(0, 192, 255, 0.8)'
    ],
    forest: [
        'rgba(0, 255, 128, 0.8)',
        'rgba(128, 255, 0, 0.8)',
        'rgba(0, 192, 128, 0.8)',
        'rgba(64, 255, 64, 0.8)'
    ],
    cosmic: [
        'rgba(128, 0, 255, 0.8)',
        'rgba(255, 0, 255, 0.8)',
        'rgba(64, 0, 255, 0.8)',
        'rgba(255, 0, 128, 0.8)'
    ]
};

function getRandomPalette() {
    const palettes = Object.values(colorPalettes);
    return palettes[Math.floor(Math.random() * palettes.length)];
}

// Create initial background blobs immediately
createInitialBlobs();
// Start random blob generation with slower interval
setInterval(createRandomBlob, 3000);

// Event listeners
space.addEventListener("mousedown", (e) => {
    isHolding = true;
    const actualX = e.clientX - xOffset;
    const actualY = e.clientY - yOffset;
    
    // Start timer for hold detection
    holdTimer = setTimeout(() => {
        if (isHolding && !isDragging) {
            // Start creating blobs while holding
            blobInterval = setInterval(() => {
                if (isHolding && !isDragging) {
                    createBlobCluster(
                        actualX + (Math.random() * 100 - 50),
                        actualY + (Math.random() * 100 - 50),
                        true,
                        true
                    );
                }
            }, 200); // Create a new blob every 200ms
        }
    }, HOLD_DELAY);
});

space.addEventListener("mousemove", (e) => {
    if (isHolding) {
        // Only start dragging if we've moved a significant amount
        if (!isDragging && 
            (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5)) {
            startDragging(e);
            // Clear timers if we start dragging
            clearTimeout(holdTimer);
            clearInterval(blobInterval);
        }
        
        if (isDragging) {
            drag(e);
        }
    }
});

space.addEventListener("mouseup", () => {
    isHolding = false;
    if (isDragging) {
        stopDragging();
    }
    clearTimeout(holdTimer);
    clearInterval(blobInterval);
});

space.addEventListener("mouseleave", () => {
    isHolding = false;
    if (isDragging) {
        stopDragging();
    }
    clearTimeout(holdTimer);
    clearInterval(blobInterval);
});

function startBlobGrowth(x, y) {
    // Create initial small blob
    currentScale = 0.1;
    currentBlob = createGrowingBlobCluster(x, y);
    
    // Start growing the blob
    growthInterval = setInterval(() => {
        if (currentScale < MAX_SCALE) {
            currentScale += GROWTH_RATE;
            updateBlobSize();
        }
    }, GROWTH_INTERVAL);
}

function createGrowingBlobCluster(baseX, baseY) {
    const cluster = document.createElement('div');
    cluster.className = 'blob-cluster';
    cluster.style.left = `${baseX}px`;
    cluster.style.top = `${baseY}px`;
    
    const numBlobs = Math.floor(Math.random() * 4) + 4;
    const palette = getRandomPalette();
    
    for (let i = 0; i < numBlobs; i++) {
        const blob = document.createElement('div');
        blob.className = 'aura intense';
        
        const offsetX = Math.random() * 100 - 50;
        const offsetY = Math.random() * 100 - 50;
        
        blob.style.left = `${offsetX}px`;
        blob.style.top = `${offsetY}px`;
        
        const color1 = palette[Math.floor(Math.random() * palette.length)];
        const color2 = palette[Math.floor(Math.random() * palette.length)];
        const angle = Math.random() * 360;
        blob.style.background = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
        
        blob.style.transform = `scale(${currentScale})`;
        blob.style.transition = 'transform 0.05s ease-out';
        
        cluster.appendChild(blob);
    }
    
    space.appendChild(cluster);
    return cluster;
}

function updateBlobSize() {
    if (currentBlob) {
        const blobs = currentBlob.getElementsByClassName('aura');
        for (let blob of blobs) {
            blob.style.transform = `scale(${currentScale})`;
        }
    }
}

function stopBlobGrowth() {
    clearInterval(growthInterval);
    if (currentBlob) {
        const blobs = currentBlob.getElementsByClassName('aura');
        for (let blob of blobs) {
            blob.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            blob.style.opacity = '0.8';
        }
        currentBlob = null;
    }
    currentScale = 0.1;
}

function createInitialBlobs() {
    // Create more blobs spread across a larger area
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 80000 + 10000; // Spread across canvas
        const y = Math.random() * 80000 + 10000;
        
        const cluster = document.createElement('div');
        cluster.className = 'blob-cluster';
        cluster.style.left = `${x}px`;
        cluster.style.top = `${y}px`;
        
        // Create 3-5 blobs per cluster
        const numBlobs = Math.floor(Math.random() * 3) + 3;
        
        for (let j = 0; j < numBlobs; j++) {
            const blob = document.createElement('div');
            blob.className = 'aura';
            
            // Random position within cluster
            const offsetX = Math.random() * 60 - 30;
            const offsetY = Math.random() * 60 - 30;
            blob.style.left = `${offsetX}px`;
            blob.style.top = `${offsetY}px`;
            
            // Use colors with reduced opacity
            const color1 = colors[Math.floor(Math.random() * colors.length)].replace('0.8', '0.2');
            const color2 = colors[Math.floor(Math.random() * colors.length)].replace('0.8', '0.2');
            const angle = Math.random() * 360;
            
            blob.style.background = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
            blob.style.opacity = '0.3';
            
            // Slightly smaller scale for background blobs
            const scale = 0.6 + Math.random() * 0.3;
            blob.style.transform = `scale(${scale})`;
            
            cluster.appendChild(blob);
        }
        
        space.appendChild(cluster);
    }
}

function createRandomBlob() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Create blob within current viewport plus margin
    const margin = 2000;
    const x = -xOffset - margin + (Math.random() * (viewportWidth + 2 * margin));
    const y = -yOffset - margin + (Math.random() * (viewportHeight + 2 * margin));
    
    createBlobCluster(x, y, false, true);
}

function createBlobCluster(baseX, baseY, isIntense = false, animate = false) {
    const cluster = document.createElement('div');
    cluster.className = 'blob-cluster';
    cluster.style.left = `${baseX}px`;
    cluster.style.top = `${baseY}px`;
    cluster.style.opacity = '0';

    const numBlobs = Math.floor(Math.random() * 4) + 4;
    const blobs = [];
    const palette = getRandomPalette();
    
    for (let i = 0; i < numBlobs; i++) {
        const blob = document.createElement('div');
        blob.className = 'aura' + (isIntense ? ' intense' : '');
        
        const offsetX = Math.random() * 100 - 50;
        const offsetY = Math.random() * 100 - 50;
        
        blob.style.left = `${offsetX}px`;
        blob.style.top = `${offsetY}px`;
        
        const color1 = palette[Math.floor(Math.random() * palette.length)];
        const color2 = palette[Math.floor(Math.random() * palette.length)];
        const angle = Math.random() * 360;
        blob.style.background = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
        
        const scale = 0.8 + Math.random() * 0.4;
        blob.style.transform = animate ? `scale(${scale * 0.1})` : `scale(${scale})`;
        blob.style.opacity = animate ? '0' : '0.8';
        blob.style.animationDelay = `${Math.random() * 4}s`;
        
        cluster.appendChild(blob);
        blobs.push(blob);
    }

    space.appendChild(cluster);

    requestAnimationFrame(() => {
        cluster.style.opacity = '1';
        
        if (animate) {
            blobs.forEach((blob, index) => {
                setTimeout(() => {
                    blob.style.transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    blob.style.transform = `scale(1)`;
                    blob.style.opacity = '0.8';
                }, index * 150);
            });
        }
    });

    // Fade out and remove after 30 seconds
    setTimeout(() => {
        // Start fade out
        cluster.style.transition = 'all 2s ease-out';
        cluster.style.opacity = '0';
        
        // Remove from DOM after fade completes
        setTimeout(() => {
            cluster.remove();
        }, 2000);
    }, 30000);
}

function startDragging(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    isDragging = true;
    document.body.style.cursor = 'grabbing';
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        // Constrain movement within our large canvas
        xOffset = Math.min(Math.max(currentX, -90000), 0);
        yOffset = Math.min(Math.max(currentY, -90000), 0);

        space.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    }
}

function stopDragging() {
    isDragging = false;
    document.body.style.cursor = 'default';
}

