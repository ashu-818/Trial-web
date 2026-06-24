// Scroll-driven Coffee Pour Animation
const canvas = document.getElementById("coffee-canvas");
const context = canvas.getContext("2d");
const loader = document.getElementById("loader");
const loadProgressText = document.getElementById("load-progress");
const progressFill = document.getElementById("progress-fill");

const scrollContainer = document.querySelector(".scroll-container");

// Animation Configuration
const frameCount = 91;
const currentFrame = index => (
    `ezgif-4d7e8d259d2aed24-jpg/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
);

// Preload Images
const images = [];
let loadedCount = 0;

function preloadImages() {
    return new Promise((resolve) => {
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                loadedCount++;
                const percent = Math.floor((loadedCount / frameCount) * 100);
                loadProgressText.textContent = percent;
                
                if (loadedCount === frameCount) {
                    // Hide loader after a tiny delay
                    setTimeout(() => {
                        loader.style.opacity = '0';
                        setTimeout(() => loader.style.display = 'none', 500);
                    }, 300);
                    resolve();
                }
            };
            img.onerror = () => {
                // Keep moving even if an image fails to load
                loadedCount++;
                if (loadedCount === frameCount) {
                    loader.style.display = 'none';
                    resolve();
                }
            };
            images.push(img);
        }
    });
}

// Draw Image to Canvas with Cover Aspect Ratio
function drawImageCover(img) {
    if (!img) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.naturalWidth || img.width || 800;
    const imgHeight = img.naturalHeight || img.height || 450;
    
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (canvasRatio > imgRatio) {
        // Canvas is wider than the image aspect ratio
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
    } else {
        // Canvas is taller than the image aspect ratio
        drawWidth = canvasHeight * imgRatio;
        drawHeight = canvasHeight;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
    }
    
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Adjust Canvas Resolution
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Redraw current frame
    const scrollFraction = getScrollFraction();
    const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
    );
    if (images[frameIndex] && images[frameIndex].complete) {
        drawImageCover(images[frameIndex]);
    }
}

// Calculate how far down the scroll container we are (0.0 to 1.0)
function getScrollFraction() {
    const rect = scrollContainer.getBoundingClientRect();
    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = window.innerHeight;
    
    // Calculate progress relative to the start and end of the container
    // scrollContainer starts entering viewport when rect.top = clientHeight
    // but the sticky part activates when rect.top <= 0
    // and ends when rect.bottom <= clientHeight
    const totalScrollableDistance = scrollHeight - clientHeight;
    const currentScrollPosition = -rect.top;
    
    let fraction = currentScrollPosition / totalScrollableDistance;
    return Math.max(0, Math.min(1, fraction));
}

// Setup Narrative Panels Activation Intervals
const panels = [
    { element: document.getElementById("panel-1"), start: 0.08, end: 0.25 },
    { element: document.getElementById("panel-2"), start: 0.32, end: 0.49 },
    { element: document.getElementById("panel-3"), start: 0.56, end: 0.73 },
    { element: document.getElementById("panel-4"), start: 0.80, end: 0.95 }
];

function updateNarrativePanels(progress) {
    panels.forEach(panel => {
        if (progress >= panel.start && progress <= panel.end) {
            panel.element.classList.add("active");
        } else {
            panel.element.classList.remove("active");
        }
    });
}

// Smooth Frame Interpolation (Lerp)
let targetProgress = 0;
let currentProgress = 0;
const lerpFactor = 0.1; // Lower = smoother/slower, Higher = faster response

function animate() {
    // Lerp progress for smooth scroll effect
    currentProgress += (targetProgress - currentProgress) * lerpFactor;
    
    // Update progress bar UI
    progressFill.style.width = `${currentProgress * 100}%`;
    
    // Map progress to frame index
    const frameIndex = Math.min(
        frameCount - 1,
        Math.max(0, Math.floor(currentProgress * frameCount))
    );
    
    if (images[frameIndex] && images[frameIndex].complete) {
        drawImageCover(images[frameIndex]);
    }
    
    updateNarrativePanels(currentProgress);
    
    requestAnimationFrame(animate);
}

// Event Listeners
window.addEventListener("resize", resizeCanvas);

window.addEventListener("scroll", () => {
    targetProgress = getScrollFraction();
});

// Initialize
preloadImages().then(() => {
    resizeCanvas();
    // Start smooth animation loop
    requestAnimationFrame(animate);
});
