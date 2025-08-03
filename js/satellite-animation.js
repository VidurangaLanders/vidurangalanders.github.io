class OptimizedSatelliteAnimation {
    constructor() {
        this.setupCanvases();
        this.initializeState();
        this.precomputeTables();
        this.initializeSatellites();
        this.initializeStars();
        this.setupEventListeners();
        this.startAnimation();
    }
    
    setupCanvases() {
        this.starsCanvas = document.getElementById('stars-canvas');
        this.earthCanvas = document.getElementById('earth-canvas');
        this.satellitesCanvas = document.getElementById('satellites-canvas');
        
        this.starsCtx = this.starsCanvas.getContext('2d');
        this.earthCtx = this.earthCanvas.getContext('2d');
        this.satellitesCtx = this.satellitesCanvas.getContext('2d');
        
        this.resize();
    }
    
    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        [this.starsCanvas, this.earthCanvas, this.satellitesCanvas].forEach(canvas => {
            canvas.width = width;
            canvas.height = height;
        });
        
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
    }
    
    initializeState() {
        this.frameCount = 0;
        this.earthRotation = 0;
        this.isHomePage = true;
        this.globalOpacity = 1.0;
        this.offsetX = 0;
        
        // Performance settings
        this.EARTH_RADIUS = 150;
        this.PERSPECTIVE = 800;
        this.EARTH_TILT = -0.41; // -23.5 degrees in radians
        
        // FPS tracking
        this.fps = 60;
        this.lastTime = performance.now();
        this.frameTimeSum = 0;
        this.frameTimeCount = 0;
    }
    
    precomputeTables() {
        // Pre-compute sin/cos tables for performance
        this.sinTable = [];
        this.cosTable = [];
        const tableSize = 3600; // 0.1 degree resolution
        
        for (let i = 0; i < tableSize; i++) {
            const angle = (i / tableSize) * Math.PI * 2;
            this.sinTable[i] = Math.sin(angle);
            this.cosTable[i] = Math.cos(angle);
        }
        
        // Pre-compute earth grid positions
        this.precomputeEarthGrid();
    }
    
    fastSin(angle) {
        const normalized = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const index = Math.floor((normalized / (Math.PI * 2)) * this.sinTable.length);
        return this.sinTable[index];
    }
    
    fastCos(angle) {
        const normalized = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const index = Math.floor((normalized / (Math.PI * 2)) * this.cosTable.length);
        return this.cosTable[index];
    }
    
    precomputeEarthGrid() {
        this.earthPoints = [];
        const thetaStep = 0.2;
        const phiStep = 0.2;
        
        for (let theta = 0; theta < Math.PI; theta += thetaStep) {
            for (let phi = 0; phi < Math.PI * 2; phi += phiStep) {
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                
                this.earthPoints.push({
                    // Original sphere coordinates
                    x: this.EARTH_RADIUS * sinTheta * cosPhi,
                    y: this.EARTH_RADIUS * cosTheta,
                    z: this.EARTH_RADIUS * sinTheta * sinPhi,
                    // Pre-computed normal for lighting
                    nx: sinTheta * cosPhi,
                    ny: cosTheta,
                    nz: sinTheta * sinPhi,
                    // Texture coordinate for land/ocean
                    phi: phi,
                    theta: theta
                });
            }
        }
    }
    
    initializeSatellites() {
        this.satellites = [
            this.createSatellite(0, 280, 0.008, "QUANTUM", [255, 140, 0], 15, 0),
            this.createSatellite(Math.PI, 350, 0.006, "SPACE", [255, 165, 0], -25, Math.PI/3),
            this.createSatellite(Math.PI/2, 370, 0.005, "CYBER-SEC", [255, 100, 0], 35, Math.PI/2),
            this.createSatellite(3*Math.PI/2, 320, 0.007, "SECURE-NET", [255, 180, 50], -18, Math.PI/6)
        ];
    }
    
    createSatellite(angle, distance, speed, name, color, inclinationDeg, ascending) {
        return {
            angle: angle,
            distance: distance,
            speed: speed,
            name: name,
            color: color,
            rotZ: 0,
            inclination: inclinationDeg * Math.PI / 180,
            ascending: ascending,
            trail: [],
            maxTrailLength: 50 
        };
    }
    
    initializeStars() {
        this.stars = [];
        for (let i = 0; i < 60; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                brightness: Math.random() * 0.4 + 0.6,
                size: Math.random() * 2 + 1,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        // Pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.paused = true;
            } else {
                this.paused = false;
                this.lastTime = performance.now();
            }
        });
    }
    
    startAnimation() {
        this.animate();
    }
    
    animate() {
        if (!this.paused) {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;
            
            // Update FPS counter
            this.frameTimeSum += deltaTime;
            this.frameTimeCount++;
            if (this.frameTimeCount >= 30) {
                this.fps = Math.round(1000 / (this.frameTimeSum / this.frameTimeCount));
                this.frameTimeSum = 0;
                this.frameTimeCount = 0;
            }
            
            this.update();
            this.render();
            
            this.lastTime = currentTime;
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    update() {
        this.frameCount++;
        this.earthRotation += 0.004;
        
        // Update page state
        this.globalOpacity = this.isHomePage ? 1.0 : 0.4;
        this.offsetX = this.isHomePage ? this.width * 0.25 : 0;
        
        // Update satellites
        this.updateSatellites();
    }
    
    updateSatellites() {
        for (let satellite of this.satellites) {
            // Update position
            satellite.angle += satellite.speed;
            satellite.rotZ += 0.02;
            
            // Calculate 3D position using fast trig
            const pos3D = this.calculate3DPosition(satellite);
            satellite.currentPos = pos3D;
            
            // Update trail (less frequently)
            if (this.frameCount % 3 === 0) {
                this.updateTrail(satellite, pos3D);
            }
        }
    }
    
    calculate3DPosition(satellite) {
        // Use fast trig functions
        const cosAngle = this.fastCos(satellite.angle);
        const sinAngle = this.fastSin(satellite.angle);
        const cosInclination = this.fastCos(satellite.inclination);
        const sinInclination = this.fastSin(satellite.inclination);
        const cosAscending = this.fastCos(satellite.ascending);
        const sinAscending = this.fastSin(satellite.ascending);
        
        // Basic orbital position
        let x = cosAngle * satellite.distance;
        let y = sinAngle * satellite.distance;
        let z = 0;
        
        // Apply inclination
        const inclinedY = y * cosInclination - z * sinInclination;
        const inclinedZ = y * sinInclination + z * cosInclination;
        
        // Apply ascending node rotation
        const finalX = x * cosAscending - inclinedY * sinAscending;
        const finalY = x * sinAscending + inclinedY * cosAscending;
        const finalZ = inclinedZ + this.fastSin(satellite.angle * 3) * 10;
        
        // Calculate screen coordinates
        const perspective = this.PERSPECTIVE + finalZ;
        const screenX = finalX * this.PERSPECTIVE / perspective;
        const screenY = finalY * this.PERSPECTIVE / perspective;
        
        return {
            x: finalX,
            y: finalY,
            z: finalZ,
            screenX: screenX + this.centerX + this.offsetX,
            screenY: screenY + this.centerY,
            visible: finalZ > -this.PERSPECTIVE * 0.8
        };
    }
    
    updateTrail(satellite, pos3D) {
        satellite.trail.push({
            screenX: pos3D.screenX,
            screenY: pos3D.screenY,
            z: pos3D.z,
            visible: pos3D.visible
        });
        
        if (satellite.trail.length > satellite.maxTrailLength) {
            satellite.trail.shift();
        }
    }
    
    render() {
        // Only redraw stars occasionally
        if (this.frameCount % 4 === 0) {
            this.renderStars();
        }
        
        // Always redraw earth and satellites
        this.renderEarth();
        this.renderSatellites();
    }
    
    renderStars() {
        const ctx = this.starsCtx;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = 'white';
        
        for (let star of this.stars) {
            const brightness = star.brightness * (0.7 + 0.3 * Math.sin(this.frameCount * star.twinkleSpeed + star.twinklePhase));
            ctx.globalAlpha = brightness * 0.6 * this.globalOpacity;
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
    
    renderEarth() {
        const ctx = this.earthCtx;
        ctx.clearRect(0, 0, this.width, this.height);
        
        // Pre-compute rotation matrices
        const cosEarthRot = this.fastCos(this.earthRotation);
        const sinEarthRot = this.fastSin(this.earthRotation);
        const cosTilt = this.fastCos(this.EARTH_TILT);
        const sinTilt = this.fastSin(this.EARTH_TILT);
        
        const visiblePoints = [];
        
        // Transform all points
        for (let point of this.earthPoints) {
            // Apply rotations using matrix multiplication
            const x1 = point.x * cosEarthRot - point.z * sinEarthRot;
            const z1 = point.x * sinEarthRot + point.z * cosEarthRot;
            const y2 = point.y * cosTilt - z1 * sinTilt;
            const z2 = point.y * sinTilt + z1 * cosTilt;
            
            // Frustum culling
            if (z2 > -this.EARTH_RADIUS * 0.3) {
                // Transform normal for lighting
                const nx1 = point.nx * cosEarthRot - point.nz * sinEarthRot;
                const nz1 = point.nx * sinEarthRot + point.nz * cosEarthRot;
                const ny2 = point.ny * cosTilt - nz1 * sinTilt;
                const nz2 = point.ny * sinTilt + nz1 * cosTilt;
                
                // Simple lighting calculation
                const luminance = Math.max(0, nx1 * (-0.4) + ny2 * (-0.3) + nz2 * 0.7);
                
                // Simple texture
                const texture = Math.sin(point.phi * 3) * Math.sin(point.theta * 2) > 0.3;
                
                visiblePoints.push({
                    x: x1 + this.centerX + this.offsetX,
                    y: y2 + this.centerY,
                    luminance: luminance,
                    isLand: texture
                });
            }
        }
        
        // Render points efficiently
        this.renderEarthPoints(ctx, visiblePoints);
    }
    
    renderEarthPoints(ctx, points) {
        // Group points by color
        const landPoints = [];
        const oceanPoints = [];
        
        for (let point of points) {
            if (point.isLand) {
                landPoints.push(point);
            } else {
                oceanPoints.push(point);
            }
        }
        
        // Render ocean points
        this.renderPointGroup(ctx, oceanPoints, false);
        
        // Render land points
        this.renderPointGroup(ctx, landPoints, true);
    }
    
    renderPointGroup(ctx, points, isLand) {
        ctx.globalAlpha = this.globalOpacity;
        
        for (let point of points) {
            const colors = this.getEarthColors(isLand, point.luminance);
            ctx.fillStyle = `rgb(${colors.r}, ${colors.g}, ${colors.b})`;
            
            ctx.beginPath();
            ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
    
    getEarthColors(isLand, luminance) {
        if (this.isHomePage) {
            if (isLand) {
                return {
                    r: Math.floor(70 + luminance * 80),
                    g: Math.floor(90 + luminance * 100),
                    b: Math.floor(40 + luminance * 60)
                };
            } else {
                return {
                    r: Math.floor(30 + luminance * 40),
                    g: Math.floor(70 + luminance * 80),
                    b: Math.floor(120 + luminance * 100)
                };
            }
        } else {
            if (isLand) {
                return {
                    r: Math.floor(90 + luminance * 80),
                    g: Math.floor(60 + luminance * 60),
                    b: Math.floor(30 + luminance * 40)
                };
            } else {
                return {
                    r: Math.floor(60 + luminance * 60),
                    g: Math.floor(40 + luminance * 40),
                    b: Math.floor(20 + luminance * 30)
                };
            }
        }
    }
    
    renderSatellites() {
        const ctx = this.satellitesCtx;
        ctx.clearRect(0, 0, this.width, this.height);
        
        for (let satellite of this.satellites) {
            if (!satellite.currentPos || !satellite.currentPos.visible) continue;
            
            // Draw trail
            this.drawTrail(ctx, satellite);
            
            // Draw satellite
            this.drawSatellite(ctx, satellite);
        }
    }
    
    drawTrail(ctx, satellite) {
        if (satellite.trail.length < 2) return;
        
        ctx.lineWidth = 1;
        const trailLength = satellite.trail.length;
        
        for (let i = 1; i < trailLength; i++) {
            const current = satellite.trail[i];
            const previous = satellite.trail[i - 1];
            
            if (!current.visible && !previous.visible) continue;
            
            const age = i / trailLength;
            const opacity = age * age * this.globalOpacity;
            
            ctx.strokeStyle = `rgba(${satellite.color[0]}, ${satellite.color[1]}, ${satellite.color[2]}, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(previous.screenX, previous.screenY);
            ctx.lineTo(current.screenX, current.screenY);
            ctx.stroke();
        }
    }
    
    drawSatellite(ctx, satellite) {
        const pos = satellite.currentPos;
        const scale = Math.max(0.6, Math.min(1.4, 1 + pos.z / 400));
        const brightness = Math.max(0.4, Math.min(1.0, 0.7 + pos.z / 600));
        
        ctx.save();
        ctx.translate(pos.screenX, pos.screenY);
        ctx.scale(scale, scale);
        ctx.globalAlpha = this.globalOpacity * brightness;
        
        // Main body
        ctx.fillStyle = `rgb(${satellite.color[0]}, ${satellite.color[1]}, ${satellite.color[2]})`;
        ctx.fillRect(-4, -4, 8, 8);
        
        // Solar panels
        ctx.fillStyle = `rgb(50, 90, 160)`;
        const panelOffset = Math.sin(satellite.rotZ) * 2;
        ctx.fillRect(-12, panelOffset - 1, 6, 2);
        ctx.fillRect(6, -panelOffset - 1, 6, 2);
        
        // Communication dish
        ctx.fillStyle = `rgb(200, 200, 200)`;
        ctx.beginPath();
        ctx.arc(2, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Name (only on home page)
        if (this.isHomePage) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(satellite.name, 0, 20);
            
            // Status lights
            const lightPhase = this.frameCount % 120;
            if (lightPhase < 60) {
                ctx.fillStyle = 'rgb(0, 255, 0)';
                ctx.beginPath();
                ctx.arc(-3, -6, 1, 0, Math.PI * 2);
                ctx.fill();
            }
            if ((lightPhase + 60) % 120 < 60) {
                ctx.fillStyle = 'rgb(255, 0, 0)';
                ctx.beginPath();
                ctx.arc(3, -6, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
}

// Initialize animation when page loads
let animation;
window.addEventListener('load', () => {
    // Check if page state detection is needed
    const homePageCheck = () => {
        const homeElement = document.getElementById('home');
        if (homeElement && animation) {
            animation.isHomePage = homeElement.classList.contains('active');
        }
    };
    
    animation = new OptimizedSatelliteAnimation();
    
    // Monitor page changes
    const observer = new MutationObserver(homePageCheck);
    const homeElement = document.getElementById('home');
    if (homeElement) {
        observer.observe(homeElement, { attributes: true, attributeFilter: ['class'] });
    }
    
    // Also check other page elements
    document.querySelectorAll('.page').forEach(page => {
        observer.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
});