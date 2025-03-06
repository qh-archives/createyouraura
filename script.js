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
let currentMessageBlob = null;
let messageOverlay = null;

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

// ====== Mouse Event Listeners ======
space.addEventListener("mousedown", handlePointerDown);
space.addEventListener("mousemove", handlePointerMove);
space.addEventListener("mouseup", handlePointerUp);
space.addEventListener("mouseleave", handlePointerLeave);

// ====== Touch Event Listeners ======
space.addEventListener("touchstart", handleTouchStart, { passive: false });
space.addEventListener("touchmove", handleTouchMove, { passive: false });
space.addEventListener("touchend", (e) => {
    if (isHolding && !isDragging && currentBlob) {
        // Get the last touch position
        const lastTouch = e.changedTouches[0];
        
        // Create message button near the blob
        const button = document.createElement('button');
        button.className = 'message-button leave-message-btn';
        button.textContent = 'Leave a Message';
        button.style.left = `${currentBlob.offsetLeft}px`;
        button.style.top = `${currentBlob.offsetTop + 60}px`;
        
        button.onclick = () => {
            currentMessageBlob = currentBlob;
            messageOverlay.classList.add('active');
        };
        
        space.appendChild(button);
    }
    
    isHolding = false;
    if (isDragging) {
        stopDragging();
    }
    clearTimeout(holdTimer);
    clearInterval(blobInterval);
});
space.addEventListener("touchcancel", (e) => {
    if (isHolding && !isDragging && currentBlob) {
        const button = document.createElement('button');
        button.className = 'message-button leave-message-btn';
        button.textContent = 'Leave a Message';
        button.style.left = `${currentBlob.offsetLeft}px`;
        button.style.top = `${currentBlob.offsetTop + 60}px`;
        
        button.onclick = () => {
            currentMessageBlob = currentBlob;
            messageOverlay.classList.add('active');
        };
        
        space.appendChild(button);
    }
    
    isHolding = false;
    if (isDragging) {
        stopDragging();
    }
    clearTimeout(holdTimer);
    clearInterval(blobInterval);
});

// ====== Event Handler Functions ======
function handlePointerDown(e) {
    isHolding = true;
    
    // Get coordinates (whether mouse or touch)
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : null);
    
    if (clientX === null || clientY === null) return;
    
    const actualX = clientX - xOffset;
    const actualY = clientY - yOffset;
    
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
}

function handleTouchStart(e) {
    // Prevent default to avoid scrolling on touch devices
    if (e.cancelable) {
        e.preventDefault();
    }
    handlePointerDown(e);
}

function handlePointerMove(e) {
    if (isHolding) {
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : null);
        
        if (clientX === null || clientY === null) return;
        
        // For touch events, we don't have movementX/Y, so we need to calculate distance
        // Only start dragging if we've moved a significant amount
        if (!isDragging) {
            const movementX = e.movementX || 0; // only available for mouse events
            const movementY = e.movementY || 0; // only available for mouse events
            
            if (Math.abs(movementX) > 5 || Math.abs(movementY) > 5) {
                startDragging(e);
                // Clear timers if we start dragging
                clearTimeout(holdTimer);
                clearInterval(blobInterval);
            }
        }
        
        if (isDragging) {
            drag(e);
        }
    }
}

function handleTouchMove(e) {
    // Prevent default to avoid scrolling on touch devices
    if (e.cancelable) {
        e.preventDefault();
    }
    
    if (isHolding) {
        // For touch events, we don't have movement, so always start dragging if holding
        if (!isDragging) {
            startDragging(e);
            // Clear timers if we start dragging
            clearTimeout(holdTimer);
            clearInterval(blobInterval);
        }
        
        if (isDragging) {
            drag(e);
        }
    }
}

function handlePointerUp() {
    if (isHolding && !isDragging && currentBlob) {
        // Create message button near the blob
        const button = document.createElement('button');
        button.className = 'message-button leave-message-btn'; // Add specific class for identification
        button.textContent = 'Leave a Message';
        button.style.left = `${currentBlob.offsetLeft}px`;
        button.style.top = `${currentBlob.offsetTop + 60}px`; // Position below blob
        
        button.onclick = () => {
            currentMessageBlob = currentBlob;
            messageOverlay.classList.add('active');
        };
        
        space.appendChild(button);
    }
    
    isHolding = false;
    if (isDragging) {
        stopDragging();
    }
    clearTimeout(holdTimer);
    clearInterval(blobInterval);
}

function handlePointerLeave() {
    isHolding = false;
    if (isDragging) {
        stopDragging();
    }
    clearTimeout(holdTimer);
    clearInterval(blobInterval);
}

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

    // Set this as the current blob
    currentBlob = cluster;

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

    return cluster;
}

function startDragging(e) {
    // Get coordinates from either mouse or touch event
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    
    initialX = clientX - xOffset;
    initialY = clientY - yOffset;
    isDragging = true;
    document.body.style.cursor = 'grabbing';
}

function drag(e) {
    if (isDragging) {
        if (e.preventDefault) e.preventDefault();
        
        // Get coordinates from either mouse or touch event
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        
        currentX = clientX - initialX;
        currentY = clientY - initialY;

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

// Add pinch-to-zoom functionality for mobile
let initialDistance = 0;
let currentZoom = 1;

space.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
        // Two fingers are touching the screen - prepare for pinch/zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
    }
}, { passive: false });

space.addEventListener('touchmove', function(e) {
    if (e.touches.length === 2) {
        // Handle pinch/zoom
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        if (initialDistance > 0) {
            // Calculate new zoom level
            const newZoom = currentZoom * (currentDistance / initialDistance);
            // Limit zoom levels
            const limitedZoom = Math.min(Math.max(newZoom, 0.5), 3);
            
            // Apply new zoom to the space - we're modifying the transform
            const currentTransform = space.style.transform;
            // Extract current translation
            const translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            if (translateMatch) {
                const translateX = translateMatch[1];
                const translateY = translateMatch[2];
                
                // Apply new transform with both translation and scale
                space.style.transform = `translate(${translateX}, ${translateY}) scale(${limitedZoom})`;
                
                // Update current zoom
                currentZoom = limitedZoom;
                
                // Reset initial distance for next calculation
                initialDistance = currentDistance;
            }
        }
    }
}, { passive: false });

// Disable default pinch-zoom behavior on the page
document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Add additional meta tag to prevent page zooming
function addViewportMeta() {
    let meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);
}

// Call this function when the page loads
addViewportMeta();

// Add the createMessageOverlay function if it doesn't exist
function createMessageOverlay() {
    messageOverlay = document.createElement('div');
    messageOverlay.className = 'message-overlay';
    messageOverlay.style.display = 'flex';
    messageOverlay.style.justifyContent = 'center';
    messageOverlay.style.alignItems = 'center';
    
    const container = document.createElement('div');
    container.className = 'message-input-container';
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.borderRadius = '10px';
    container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    container.style.position = 'relative'; // For absolute positioning of button
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.minHeight = '200px'; // Give container minimum height
    
    const textarea = document.createElement('textarea');
    textarea.className = 'message-input';
    textarea.placeholder = 'Type your message here...';
    textarea.style.width = '500px';
    textarea.style.height = 'auto';
    textarea.style.minHeight = '100px';
    textarea.style.maxHeight = '400px';
    textarea.style.resize = 'vertical';
    textarea.style.overflowY = 'auto';
    textarea.style.marginBottom = '60px'; // Space for button below
    
    const submitButton = document.createElement('button');
    submitButton.className = 'message-button';
    submitButton.textContent = 'Submit';
    submitButton.style.position = 'absolute'; // Position absolutely
    submitButton.style.bottom = '20px'; // Distance from bottom
    submitButton.style.left = '50%'; // Center horizontally
    submitButton.style.transform = 'translateX(-50%)'; // Perfect centering
    submitButton.style.padding = '8px 20px';
    submitButton.style.minWidth = '100px'; // Minimum width for button
    submitButton.onclick = handleMessageSubmit;
    
    container.appendChild(textarea);
    container.appendChild(submitButton);
    messageOverlay.appendChild(container);
    document.body.appendChild(messageOverlay);
    
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

function handleMessageSubmit() {
    const textarea = messageOverlay.querySelector('.message-input');
    const message = textarea.value.trim();
    
    if (message && currentMessageBlob) {
        // Create text element without any container styling
        const messageElement = document.createElement('div');
        messageElement.style.position = 'absolute';
        messageElement.style.left = '50%';
        messageElement.style.top = '0';
        messageElement.style.transform = 'translate(-50%, -100%)';
        messageElement.style.width = '200px';
        messageElement.style.textAlign = 'center';
        messageElement.style.color = 'white';
        messageElement.style.fontFamily = "'JetBrains Mono', monospace";
        messageElement.style.fontSize = '14px';
        messageElement.style.pointerEvents = 'none';
        messageElement.style.zIndex = '1000';
        messageElement.style.whiteSpace = 'pre-wrap';
        messageElement.style.wordBreak = 'break-word';
        messageElement.style.textShadow = '0 0 2px rgba(0,0,0,0.3)';
        messageElement.textContent = message;
        
        currentMessageBlob.appendChild(messageElement);
        
        // Remove all "Leave a Message" buttons
        const buttons = document.getElementsByClassName('leave-message-btn');
        while (buttons.length > 0) {
            buttons[0].remove();
        }
    }
    
    // Reset and hide overlay
    textarea.value = '';
    messageOverlay.classList.remove('active');
    currentMessageBlob = null;
}

// Call this when the page loads
createMessageOverlay();
