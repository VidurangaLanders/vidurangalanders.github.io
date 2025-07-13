// Advanced Satellite Animation
let satelliteSketch = function(p) {
    let earthRotation = 0;
    let satellites = [];
    let stars = [];
    let frameCounter = 0;
    let isHomePage = true;
    let globalOpacity = 1.0;
    let offsetX = 0;

    // Performance optimization: cache frequently used values
    let cachedLuminanceChars = " .,-~:;=!*#$@";
    let cachedPerspective = 800;
    let cachedEarthRadius = 150;
    let cachedTilt = p.radians(-23.5);
    
    // Pre-calculate brightness multipliers to avoid repeated calculations
    let brightnessMults = {
        land: { r: 90, g: 110, b: 60 },
        ocean: { r: 40, g: 90, b: 135 },
        landOrange: { r: 90, g: 60, b: 40 },
        oceanOrange: { r: 70, g: 50, b: 30 }
    };
    
    p.setup = function() {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent('satellite-animation');
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont('Courier New');
        
        // Initialize satellites with pre-calculated values
        satellites = [
            createSatellite(0, 280, 0.008, "QUANTUM", [255, 140, 0], 15, 0, 800),
            createSatellite(p.PI, 350, 0.006, "SPACE", [255, 165, 0], -25, p.PI/3, 750),
            createSatellite(p.PI/2, 420, 0.005, "CYBER-SEC", [255, 100, 0], 35, p.PI/2, 700),
            createSatellite(3*p.PI/2, 320, 0.007, "SECURE-NET", [255, 180, 50], -18, p.PI/6, 850)
        ];

        // Optimized star generation
        initializeStars();
        
    };

    function createSatellite(angle, distance, speed, name, color, inclinationDeg, ascending, trailLength) {
        return {
            angle: angle,
            distance: distance,
            speed: speed,
            name: name,
            color: color,
            rotZ: 0,
            beamActive: false,
            beamTimer: 0,
            nextBeamTime: p.random(90, 250),
            inclination: p.radians(inclinationDeg),
            ascending: ascending,
            trail: [],
            maxTrailLength: trailLength
        };
    }
        
    //Create background stars
    function initializeStars() {
        stars = [];
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: p.random(p.width),
                y: p.random(p.height),
                char: p.random(['●']),
                brightness: p.random(0.6, 1.0),
                size: p.random(2, 4),
                twinkleSpeed: p.random(0.0008, 0.002),
                twinklePhase: p.random(p.TWO_PI),
                currentBrightness: 1.0
            });
        }
    }
    
    p.draw = function() {
        p.clear();
        frameCounter++;
        
        // Update page state and opacity once per frame
        updatePageState();
        
        // Optimized star rendering - update every 8 frames
        if (frameCounter % 8 === 0) {
            updateAndDrawStars();
        } else {
            // Just draw stars with cached brightness
            drawCachedStars();
        }
        
        p.translate(p.width/2 + offsetX, p.height/2);
        
        // Draw the globe
        drawGlobe3D();
        
        // Manage satellite beams less frequently
        if (frameCounter % 30 === 0) {
            manageSatelliteBeams();
        }
        
        // Update and draw satellites
        updateSatellites();
        
        // Slow Earth rotation
        earthRotation += 0.004;
    };

    function updatePageState() {
        let newHomePage = document.getElementById('home').classList.contains('active');
        if (newHomePage !== isHomePage) {
            isHomePage = newHomePage;
        }
        // Update positioning and opacity based on current page state
        globalOpacity = isHomePage ? 1.0 : 0.4;
        offsetX = isHomePage ? p.width * 0.25 : 0;
    }
    
    function updateAndDrawStars() {
        for (let star of stars) {
            // Update cached brightness
            star.currentBrightness = 0.4 + 0.6 * (0.5 + 0.5 * p.sin(frameCounter * star.twinkleSpeed + star.twinklePhase));
            drawStar(star);
        }
    }
    
    function drawCachedStars() {
        for (let star of stars) {
            drawStar(star);
        }
    }
    
    function drawStar(star) {
        p.fill(255, 255, 255, star.currentBrightness * 80 * globalOpacity);
        p.textSize(star.size);
        p.text(star.char, star.x, star.y);
    }
    
    function updateSatellites() {
        for (let satellite of satellites) {
            // Calculate 3D position
            let pos3D = calculate3DPosition(satellite);
            
            // Update trail
            updateTrail(satellite, pos3D);
            
            // Draw components
            draw3DTrail(satellite);
            drawSatellite3D(satellite, pos3D);
            
            // Update position
            satellite.angle += satellite.speed;
            satellite.rotZ += 0.015;
        }
    }
    
    function updateTrail(satellite, pos3D) {
        satellite.trail.push({
            x: pos3D.x,
            y: pos3D.y,
            z: pos3D.z,
            screenX: pos3D.screenX,
            screenY: pos3D.screenY,
            visible: pos3D.visible
        });
        
        if (satellite.trail.length > satellite.maxTrailLength) {
            satellite.trail.shift();
        }
    }
    
    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        
        // Update star positions efficiently
        for (let star of stars) {
            if (star.x > p.width) star.x = p.random(p.width);
            if (star.y > p.height) star.y = p.random(p.height);
        }
    };

    function calculate3DPosition(satellite) {
        // Pre-calculate trigonometric values
        let cosAngle = p.cos(satellite.angle);
        let sinAngle = p.sin(satellite.angle);
        let cosInclination = p.cos(satellite.inclination);
        let sinInclination = p.sin(satellite.inclination);
        let cosAscending = p.cos(satellite.ascending);
        let sinAscending = p.sin(satellite.ascending);
        
        // Basic orbital position
        let x = cosAngle * satellite.distance;
        let y = sinAngle * satellite.distance;
        let z = 0;
        
        // Apply inclination
        let inclinedY = y * cosInclination - z * sinInclination;
        let inclinedZ = y * sinInclination + z * cosInclination;
        
        // Apply ascending node rotation
        let finalX = x * cosAscending - inclinedY * sinAscending;
        let finalY = x * sinAscending + inclinedY * cosAscending;
        let finalZ = inclinedZ + p.sin(satellite.angle * 3) * 15;
        
        // Calculate screen coordinates
        let screenX = finalX * cachedPerspective / (cachedPerspective + finalZ);
        let screenY = finalY * cachedPerspective / (cachedPerspective + finalZ);
        
        return {
            x: finalX,
            y: finalY,
            z: finalZ,
            screenX: screenX,
            screenY: screenY,
            visible: finalZ > -cachedPerspective * 0.8
        };
    }
    
    function draw3DTrail(satellite) {
        if (satellite.trail.length < 2) return;
        
        p.strokeWeight(1);
        let trailLength = satellite.trail.length;
        let baseR = satellite.color[0];
        let baseG = satellite.color[1];
        let baseB = satellite.color[2];
        
        for (let i = 1; i < trailLength; i++) {
            let current = satellite.trail[i];
            let previous = satellite.trail[i - 1];
            
            if (!current.visible && !previous.visible) continue;
            
            // Optimized opacity calculation
            let age = i / trailLength;
            let ageOpacity = age * age; // Quadratic fade
            let depthOpacity = p.constrain(p.map(current.z, -200, 200, 0.3, 1.0), 0.1, 1.0);
            let finalOpacity = ageOpacity * depthOpacity * globalOpacity;
            
            // Optimized color calculation
            let colorVar = p.sin(i * 0.1) * 20;
            p.stroke(baseR + colorVar, baseG + colorVar * 0.75, baseB + colorVar * 0.5, finalOpacity * 120);
            
            p.line(previous.screenX, previous.screenY, current.screenX, current.screenY);
            
            // Trail particles for newer segments
            if (i > trailLength - 15 && finalOpacity > 0.3) {
                p.fill(baseR + colorVar, baseG + colorVar * 0.75, baseB + colorVar * 0.5, finalOpacity * 80);
                p.noStroke();
                p.textSize(3);
                p.text('·', current.screenX, current.screenY);
            }
        }
        
        p.noStroke();
    }

    function manageSatelliteBeams() {
        let activeBeams = satellites.filter(sat => sat.beamActive).length;
        
        for (let satellite of satellites) {
            if (satellite.beamActive) {
                satellite.beamTimer++;
                if (satellite.beamTimer > 10) {
                    satellite.beamActive = false;
                    satellite.beamTimer = 0;
                    satellite.nextBeamTime = frameCounter + p.random(100, 200);
                }
            } else {
                if (frameCounter >= satellite.nextBeamTime && activeBeams < 1) {
                    satellite.beamActive = true;
                    satellite.beamTimer = 0;
                    activeBeams++;
                }
            }
        }
    }
    
    function drawGlobe3D() {
        p.textSize(6);
        p.noStroke();
        
        // Pre-calculate rotation values
        let cosEarthRot = p.cos(earthRotation);
        let sinEarthRot = p.sin(earthRotation);
        let cosTilt = p.cos(cachedTilt);
        let sinTilt = p.sin(cachedTilt);
        
        // Optimized grid with larger steps
        for (let theta = 0; theta < p.PI; theta += 0.175) {
            let cosTheta = p.cos(theta);
            let sinTheta = p.sin(theta);
            
            for (let phi = 0; phi < p.TWO_PI; phi += 0.15) {
                let cosPhi = p.cos(phi);
                let sinPhi = p.sin(phi);
                
                // Original sphere coordinates
                let x = cachedEarthRadius * sinTheta * cosPhi;
                let y = cachedEarthRadius * cosTheta;
                let z = cachedEarthRadius * sinTheta * sinPhi;
                
                // Apply rotations
                let x1 = x * cosEarthRot - z * sinEarthRot;
                let z1 = x * sinEarthRot + z * cosEarthRot;
                let y2 = y * cosTilt - z1 * sinTilt;
                let z2 = y * sinTilt + z1 * cosTilt;
                
                // Visibility check
                if (z2 > -cachedEarthRadius * 0.3) {
                    // Calculate lighting more efficiently
                    let nx = sinTheta * cosPhi;
                    let ny = cosTheta;
                    let nz = sinTheta * sinPhi;
                    
                    let nx1 = nx * cosEarthRot - nz * sinEarthRot;
                    let nz1 = nx * sinEarthRot + nz * cosEarthRot;
                    let ny2 = ny * cosTilt - nz1 * sinTilt;
                    let nz2 = ny * sinTilt + nz1 * cosTilt;
                    
                    // Optimized lighting calculation
                    let luminance = nx1 * (-0.4) + ny2 * (-0.3) + nz2 * 0.7;
                    let texture = p.noise(phi * 2 + earthRotation * 0.05, theta * 2, 0);
                    luminance = p.constrain((luminance + (texture - 0.5) * 0.25 + 1) / 2, 0, 1);
                    
                    let charIndex = p.floor(luminance * (cachedLuminanceChars.length - 1));
                    let char = cachedLuminanceChars[charIndex];
                    
                    if (char !== ' ') {
                        let colors = getEarthColors(texture > 0.53, luminance);
                        p.fill(colors.r, colors.g, colors.b, 255 * globalOpacity);
                        p.text(char, x1, y2);
                    }
                }
            }
        }
    }
    
    function getEarthColors(isLand, luminance) {
        let baseR, baseG, baseB;
        
        if (isHomePage) {
            if (isLand) {
                baseR = 70; baseG = 90; baseB = 40;
                return {
                    r: baseR + luminance * brightnessMults.land.r,
                    g: baseG + luminance * brightnessMults.land.g,
                    b: baseB + luminance * brightnessMults.land.b
                };
            } else {
                baseR = 30; baseG = 70; baseB = 120;
                return {
                    r: baseR + luminance * brightnessMults.ocean.r,
                    g: baseG + luminance * brightnessMults.ocean.g,
                    b: baseB + luminance * brightnessMults.ocean.b
                };
            }
        } else {
            if (isLand) {
                baseR = 90; baseG = 60; baseB = 30;
                return {
                    r: baseR + luminance * brightnessMults.landOrange.r,
                    g: baseG + luminance * brightnessMults.landOrange.g,
                    b: baseB + luminance * brightnessMults.landOrange.b
                };
            } else {
                baseR = 60; baseG = 40; baseB = 20;
                return {
                    r: baseR + luminance * brightnessMults.oceanOrange.r,
                    g: baseG + luminance * brightnessMults.oceanOrange.g,
                    b: baseB + luminance * brightnessMults.oceanOrange.b
                };
            }
        }
    }

    function drawSatellite3D(satellite, pos3D) {
        if (!pos3D.visible) return;
        
        // Calculate scale and brightness based on depth
        let scale = p.constrain(p.map(pos3D.z, -200, 200, 0.6, 1.4), 0.4, 1.6);
        let depthBrightness = p.constrain(p.map(pos3D.z, -200, 200, 0.4, 1.0), 0.3, 1.0);
        
        // Pre-calculate color values
        let r = satellite.color[0] * depthBrightness;
        let g = satellite.color[1] * depthBrightness;
        let b = satellite.color[2] * depthBrightness;
        let opacity = globalOpacity;
        
        p.push();
        p.translate(pos3D.screenX, pos3D.screenY);
        p.scale(scale);
        p.rotate(p.atan2(-pos3D.screenY, -pos3D.screenX));
        
        // Draw satellite components with optimized colors
        drawSatelliteComponents(satellite, r, g, b, opacity, depthBrightness);
        
        p.pop();
        
        // Draw beam if active
        if (satellite.beamActive) {
            let beamOpacity = 50 * opacity * depthBrightness * (0.9 + 0.1 * p.sin(frameCounter * 0.15));
            p.stroke(r, g, b, beamOpacity);
            p.strokeWeight(2);
            p.line(pos3D.screenX, pos3D.screenY, 0, 0);
        }
        
        p.noStroke();
    }
    
    function drawSatelliteComponents(satellite, r, g, b, opacity, brightness) {
        
        // Main body
        p.fill(r, g, b, 230 * opacity);
        p.textSize(12);
        p.text('▉', 0, 0);
        
        // Solar panels with animation
        let panelOffset = p.sin(satellite.rotZ);
        p.fill(50 * brightness, 90 * brightness, 160 * brightness, 230 * opacity);
        p.textSize(16);
        p.text('==', -12, panelOffset);
        p.text('==', 12, -panelOffset);
        
        // Communication dish
        p.fill(200 * brightness, 200 * brightness, 200 * brightness, 170 * opacity);
        p.textSize(14);
        p.text('◔', 5, -5);
        
        // Thermal radiators
        p.fill(60, 60, 60, 240 * opacity);
        p.textSize(10);
        p.text('▤', 0, 2);
        
        // Name display on home page only
        if (isHomePage) {
            // Name
            p.fill(255, 255, 255, 80 * globalOpacity);
            p.textSize(7);
            p.text(satellite.name, 0, 25);

            // Status lights with optimized timing
            let lightPhase = frameCounter % 60;
            if (lightPhase < 30) {
                // Green Light
                p.fill(0, 255 * brightness, 0, 255 * brightness * opacity);
                p.textSize(6);
                p.text('●', -6, -5);
            }
            if ((lightPhase + 30) % 60 < 30) {
                //Red Light
                p.fill(255 * brightness, 0, 0, 255 * brightness * opacity);
                p.textSize(6);
                p.text('●', 5, -5);
            }
        }
    }
};

// Initialize with error handling
let satelliteAnimation;
try {
    satelliteAnimation = new p5(satelliteSketch);
} catch (error) {
    console.log('Animation disabled due to performance constraints');
}

// Optimized visibility handling
document.addEventListener('visibilitychange', function() {
    if (satelliteAnimation) {
        if (document.hidden) {
            satelliteAnimation.noLoop();
        } else {
            satelliteAnimation.loop();
        }
    }
});