// Advanced Satellite Animation using p5.js - STABLE VERSION
let satelliteSketch = function(p) {
    let earthRotation = 0;
    let satellites = [];
    let stars = [];
    let frameCounter = 0;
    
    const luminanceChars = " .,-~:;=!*#$@";
    
    p.setup = function() {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent('satellite-animation');
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont('Courier New');
        
        // Create satellites with optimized settings
        satellites = [
            { 
                angle: 0, 
                distance: 280, 
                speed: 0.008,
                name: "Q-SAT-1", 
                color: [255, 140, 0], 
                rotZ: 0,
                beamActive: false,
                beamTimer: 0,
                nextBeamTime: p.random(180, 300)
            },
            { 
                angle: p.PI, 
                distance: 350, 
                speed: 0.006, 
                name: "CRYPTO-SAT", 
                color: [255, 165, 0], 
                rotZ: 0,
                beamActive: false,
                beamTimer: 0,
                nextBeamTime: p.random(240, 400)
            },
            { 
                angle: p.PI/2, 
                distance: 420, 
                speed: 0.005, 
                name: "ORBIT-AI", 
                color: [255, 100, 0], 
                rotZ: 0,
                beamActive: false,
                beamTimer: 0,
                nextBeamTime: p.random(300, 500)
            },
            { 
                angle: 3*p.PI/2, 
                distance: 320, 
                speed: 0.007, 
                name: "SECURE-NET", 
                color: [255, 180, 50], 
                rotZ: 0,
                beamActive: false,
                beamTimer: 0,
                nextBeamTime: p.random(200, 350)
            }
        ];
        
        // Create background stars
        for (let i = 0; i < 100; i++) {
            stars.push({ 
                x: p.random(p.width), 
                y: p.random(p.height), 
                char: p.random(['.', '*', '·', '°', '+']), 
                brightness: p.random(0.4, 1.0),
                size: p.random(2, 4),
                twinkleSpeed: p.random(0.008, 0.02),
                twinklePhase: p.random(p.TWO_PI)
            });
        }
    };
    
    p.draw = function() {
        p.clear();
        frameCounter++;
        
        // Get current page
        let homeActive = document.getElementById('home').classList.contains('active');
        
        // Determine animation position and brightness
        let offsetX = 0;
        let globalOpacity = 1.0;
        
        if (homeActive) {
            offsetX = p.width * 0.25;
            globalOpacity = 1.0;
        } else {
            offsetX = 0;
            globalOpacity = 0.4;
        }
        
        // Draw stars every few frames for performance
        if (frameCounter % 5 === 0) {
            for (let star of stars) {
                star.brightness = 0.4 + 0.6 * (0.5 + 0.5 * p.sin(frameCounter * star.twinkleSpeed + star.twinklePhase));
                p.fill(255, 255, 255, star.brightness * 80 * globalOpacity);
                p.textSize(star.size);
                p.text(star.char, star.x, star.y);
            }
        }
        
        p.translate(p.width/2 + offsetX, p.height/2);
        
        // Draw orbital paths
        p.stroke(255, 127, 0, 25 * globalOpacity);
        p.strokeWeight(1);
        p.noFill();
        for (let satellite of satellites) {
            p.ellipse(0, 0, satellite.distance * 2, satellite.distance * 2);
        }
        
        // Draw the fixed 3D globe
        drawGlobe3D(globalOpacity, homeActive);
        
        // Manage satellite beams less frequently
        if (frameCounter % 30 === 0) {
            manageSatelliteBeams();
        }
        
        // Draw and update satellites
        for (let satellite of satellites) {
            drawSatellite3D(satellite, globalOpacity);
            satellite.angle += satellite.speed;
            satellite.rotZ += 0.015;
        }
        
        // Slow, steady Earth rotation
        earthRotation += 0.004;
    };

    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        
        // Update star positions for new canvas size
        for (let star of stars) {
            if (star.x > p.width) star.x = p.random(p.width);
            if (star.y > p.height) star.y = p.random(p.height);
        }
    };
    
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
    
    function drawGlobe3D(globalOpacity, isHome) {
        let radius = 150;
        p.textSize(6);
        p.noStroke();
        
        // Earth's axial tilt
        let tilt = p.radians(-23.5);
        
        // Optimized grid - larger steps for better performance
        for (let theta = 0; theta < p.PI; theta += 0.175) {
            for (let phi = 0; phi < p.TWO_PI; phi += 0.15) {
                let cosTheta = p.cos(theta); 
                let sinTheta = p.sin(theta);
                let cosPhi = p.cos(phi); 
                let sinPhi = p.sin(phi);
                
                // Original sphere coordinates
                let x = radius * sinTheta * cosPhi;
                let y = radius * cosTheta;
                let z = radius * sinTheta * sinPhi;
                
                // Apply Earth's rotation around tilted axis
                let x1 = x * p.cos(earthRotation) - z * p.sin(earthRotation);
                let y1 = y;
                let z1 = x * p.sin(earthRotation) + z * p.cos(earthRotation);
                
                // Apply axial tilt
                let x2 = x1;
                let y2 = y1 * p.cos(tilt) - z1 * p.sin(tilt);
                let z2 = y1 * p.sin(tilt) + z1 * p.cos(tilt);
                
                // Only render visible parts
                if (z2 > -radius * 0.3) {
                    // Calculate lighting
                    let nx = sinTheta * cosPhi;  
                    let ny = cosTheta;
                    let nz = sinTheta * sinPhi;
                    
                    let nx1 = nx * p.cos(earthRotation) - nz * p.sin(earthRotation);
                    let ny1 = ny;
                    let nz1 = nx * p.sin(earthRotation) + nz * p.cos(earthRotation);
                    
                    let nx2 = nx1;
                    let ny2 = ny1 * p.cos(tilt) - nz1 * p.sin(tilt);
                    let nz2 = ny1 * p.sin(tilt) + nz1 * p.cos(tilt);
                    
                    // Lighting calculation
                    let lightX = -0.4, lightY = -0.3, lightZ = 0.7;
                    let lightMag = p.sqrt(lightX*lightX + lightY*lightY + lightZ*lightZ);
                    lightX /= lightMag; lightY /= lightMag; lightZ /= lightMag;
                    
                    let luminance = nx2 * lightX + ny2 * lightY + nz2 * lightZ;
                    
                    // Texture
                    let texture = p.noise(phi * 2 + earthRotation * 0.05, theta * 2, 0);
                    luminance += (texture - 0.5) * 0.25;
                    luminance = p.constrain((luminance + 1) / 2, 0, 1);
                    
                    let charIndex = p.floor(luminance * (luminanceChars.length - 1));
                    let char = luminanceChars[charIndex];
                    
                    if (char !== ' ') {
                        let r, g, b;
                        if (isHome) {
                            if (texture > 0.53) {
                                // Land
                                r = 70 + luminance * 90; 
                                g = 90 + luminance * 110; 
                                b = 40 + luminance * 60;
                            } else {
                                // Ocean
                                r = 30 + luminance * 40; 
                                g = 70 + luminance * 90; 
                                b = 120 + luminance * 135;
                            }
                        } else {
                            // Orange theme for other pages
                            if (texture > 0.53) {
                                r = 90 + luminance * 90; g = 60 + luminance * 60; b = 30 + luminance * 40;
                            } else {
                                r = 60 + luminance * 70; g = 40 + luminance * 50; b = 20 + luminance * 30;
                            }
                        }
                        p.fill(r, g, b, 255 * globalOpacity);
                        p.text(char, x2, y2);
                    }
                }
            }
        }
    }
    
    function drawSatellite3D(satellite, globalOpacity) {
        let x = p.cos(satellite.angle) * satellite.distance;
        let y = p.sin(satellite.angle) * satellite.distance;
        
        p.push();
        p.translate(x, y);
        let angleToEarth = p.atan2(-y, -x);
        p.rotate(angleToEarth);
        
        // Main satellite body
        p.fill(satellite.color[0], satellite.color[1], satellite.color[2], 170 * globalOpacity);
        p.textSize(12);
        p.text('▉', 0, 0);
        
        // Solar panels
        let panelOffset = p.sin(satellite.rotZ) * 1;
        p.fill(40, 70, 130, 140 * globalOpacity);
        p.textSize(16);
        p.text('▬', -20, panelOffset);
        p.text('▬', 20, -panelOffset);
        
        // Antenna
        p.fill(200, 200, 200, 110 * globalOpacity);
        p.textSize(10);
        p.text('◔', 6, 0);
        
        // Name (only on home page)
        if (document.getElementById('home').classList.contains('active')) {
            p.fill(255, 255, 255, 80 * globalOpacity);
            p.textSize(7);
            p.text(satellite.name, 0, 25);
        }
        p.pop();
        
        // Draw beam
        if (satellite.beamActive) {
            let beamOpacity = 50 * globalOpacity;
            beamOpacity *= (0.9 + 0.1 * p.sin(frameCounter * 0.15));
            
            p.stroke(satellite.color[0], satellite.color[1], satellite.color[2], beamOpacity);
            p.strokeWeight(1);
            p.line(x, y, 0, 0);
        }
        
        p.noStroke();
    }
};

// Initialize animation with error handling
let satelliteAnimation;
try {
    satelliteAnimation = new p5(satelliteSketch);
} catch (error) {
    console.log('Animation disabled due to performance constraints');
}

// Simplified visibility handling
document.addEventListener('visibilitychange', function() {
    if (satelliteAnimation) {
        if (document.hidden) {
            satelliteAnimation.noLoop();
        } else {
            satelliteAnimation.loop();
        }
    }
});