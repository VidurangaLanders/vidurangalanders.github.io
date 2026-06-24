class OptimizedSatelliteAnimation {
    constructor() {
        this.setupScene();
        this.initializeState();
        this.createStarfield();
        this.createEarth();
        this.createSatellites();
        this.setupEventListeners();
        this.startAnimation();
    }
    
    setupScene() {
        this.canvas = document.getElementById('webgl-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
        
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 0, 10);
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        this.scene.add(ambientLight, dirLight);
    }
    
    initializeState() {
        this.frameCount = 0;
        const homeElement = document.getElementById('home');
        this.isHomePage = homeElement ? homeElement.classList.contains('active') : true;
        this.globalOpacity = this.isHomePage ? 1.0 : 0.04;

        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        // Scale values (reduced to match the original proportions and fit the view)
        this.EARTH_RADIUS = 1.55;

        // Target positioning for layouts (sliding Earth system between center and right)
        this.targetGlobeX = 3.8;
        this.targetCameraZ = 10.0;

        // Handle responsive offsets
        this.updateLayoutTargets();
    }
    
    updateLayoutTargets() {
        const width = window.innerWidth;
        if (width < 768) {
            // Mobile: keep Earth centered
            this.targetGlobeX = 0;
            this.targetCameraZ = 12.0;
        } else {
            // Desktop
            this.targetGlobeX = this.isHomePage ? 3.8 : 0;
            this.targetCameraZ = this.isHomePage ? 10.0 : 11.0;
        }
    }
    
    createStarfield() {
        const starsCount = 400;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starsCount * 3);
        const brightness = new Float32Array(starsCount);
        
        for (let i = 0; i < starsCount * 3; i += 3) {
            // Distribute stars randomly in a sphere shell far away
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = 30 + Math.random() * 20; // distance between 30 and 50
            
            positions[i] = r * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = r * Math.cos(phi);
            
            brightness[i/3] = Math.random() * 0.5 + 0.5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));
        
        this.starfieldMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.12,
            transparent: true,
            opacity: 0.8
        });
        
        this.starfield = new THREE.Points(geometry, this.starfieldMaterial);
        this.scene.add(this.starfield);
    }
    
    createEarth() {
        // Parent systemGroup coordinates translation of both Earth and Satellites together
        this.systemGroup = new THREE.Group();
        this.scene.add(this.systemGroup);
        
        // Tilt group coordinates the axial tilt (-23.5 degrees) of Earth and its orbits
        this.tiltGroup = new THREE.Group();
        this.tiltGroup.rotation.z = -0.41;
        this.systemGroup.add(this.tiltGroup);
        
        this.globeGroup = new THREE.Group();
        this.tiltGroup.add(this.globeGroup);
        
        // Holographic dotted earth geometry
        const landPositions = [];
        const oceanPositions = [];
        
        const thetaStep = 0.035;
        const phiStep = 0.035;
        
        for (let theta = 0.05; theta < Math.PI - 0.05; theta += thetaStep) {
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            for (let phi = 0; phi < Math.PI * 2; phi += phiStep) {
                // Procedural organic landmass look
                const noise = Math.sin(phi * 3) * Math.sin(theta * 2) + 
                              Math.sin(phi * 7) * Math.sin(theta * 5) * 0.2 + 
                              Math.cos(phi * 13) * Math.cos(theta * 9) * 0.1;
                const isLand = noise > 0.2;
                
                const x = this.EARTH_RADIUS * sinTheta * Math.cos(phi);
                const y = this.EARTH_RADIUS * cosTheta;
                const z = this.EARTH_RADIUS * sinTheta * Math.sin(phi);
                
                if (isLand) {
                    landPositions.push(x, y, z);
                } else {
                    // Less dense ocean
                    if (Math.random() < 0.25) {
                        oceanPositions.push(x, y, z);
                    }
                }
            }
        }
        
        // Create land points
        const landGeom = new THREE.BufferGeometry();
        landGeom.setAttribute('position', new THREE.Float32BufferAttribute(landPositions, 3));
        this.landMaterial = new THREE.PointsMaterial({
            color: 0xff7f00, // Accent Orange
            size: 0.042,
            transparent: true,
            opacity: 0.95
        });
        this.landPoints = new THREE.Points(landGeom, this.landMaterial);
        this.globeGroup.add(this.landPoints);
        
        // Create ocean points
        const oceanGeom = new THREE.BufferGeometry();
        oceanGeom.setAttribute('position', new THREE.Float32BufferAttribute(oceanPositions, 3));
        this.oceanMaterial = new THREE.PointsMaterial({
            color: 0x1a4f8a, // Dim Blue
            size: 0.028,
            transparent: true,
            opacity: 0.3
        });
        this.oceanPoints = new THREE.Points(oceanGeom, this.oceanMaterial);
        this.globeGroup.add(this.oceanPoints);
        
        // Add a subtle wireframe sphere outline to make it feel tangible
        const outlineGeom = new THREE.SphereGeometry(this.EARTH_RADIUS, 32, 16);
        this.outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0xff7f00,
            wireframe: true,
            transparent: true,
            opacity: 0.03
        });
        this.outlineMesh = new THREE.Mesh(outlineGeom, this.outlineMaterial);
        this.globeGroup.add(this.outlineMesh);
        
        // Initial position of parent systemGroup
        this.systemGroup.position.x = this.targetGlobeX;
    }
    
    createSatellites() {
        this.satellites = [];
        this.orbitRings = [];
        
        // Distances scaled down to match the new Earth radius (1.55) and fit the viewport
        const satelliteData = [
            { distance: 2.8, speed: 0.006, name: "QUANTUM", color: 0xff8c00, inclination: 15, ascending: 0 },
            { distance: 3.5, speed: 0.004, name: "SPACE", color: 0xffa500, inclination: -25, ascending: Math.PI / 3 },
            { distance: 3.7, speed: 0.003, name: "CRYPTOGRAPHY", color: 0xff6400, inclination: 35, ascending: Math.PI / 2 },
            { distance: 3.2, speed: 0.005, name: "HARDWARE-SEC", color: 0xffb432, inclination: -18, ascending: Math.PI / 6 }
        ];
        
        satelliteData.forEach((data, index) => {
            // Orbit group manages inclination/rotation, added to tiltGroup to align with Earth's tilt
            const orbitGroup = new THREE.Group();
            orbitGroup.rotation.x = data.inclination * Math.PI / 180;
            orbitGroup.rotation.y = data.ascending;
            this.tiltGroup.add(orbitGroup);
            
            // Draw orbit ring line
            const ringGeom = new THREE.BufferGeometry();
            const ringPoints = [];
            const segments = 120;
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                ringPoints.push(
                    data.distance * Math.cos(theta),
                    data.distance * Math.sin(theta),
                    0
                );
            }
            ringGeom.setAttribute('position', new THREE.Float32BufferAttribute(ringPoints, 3));
            const ringMat = new THREE.LineBasicMaterial({
                color: 0xff7f00,
                transparent: true,
                opacity: 0.12
            });
            const orbitRing = new THREE.LineLoop(ringGeom, ringMat);
            orbitGroup.add(orbitRing);
            this.orbitRings.push(orbitRing);
            
            // Create satellite object group
            const satGroup = new THREE.Group();
            orbitGroup.add(satGroup);
            
            // 3D Satellite materials (transparent: true to enable dimming)
            const bodyMat = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.3,
                metalness: 0.8,
                transparent: true,
                opacity: 1.0
            });
            const panelMat = new THREE.MeshStandardMaterial({
                color: 0x103060,
                roughness: 0.1,
                metalness: 0.9,
                transparent: true,
                opacity: 1.0
            });
            const ledMat = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 1.0
            });
            
            // Main body
            const bodyGeom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
            const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
            satGroup.add(bodyMesh);
            
            // Solar panels
            const panelGeom = new THREE.BoxGeometry(0.24, 0.05, 0.01);
            const leftPanel = new THREE.Mesh(panelGeom, panelMat);
            leftPanel.position.x = -0.16;
            const rightPanel = leftPanel.clone();
            rightPanel.position.x = 0.16;
            satGroup.add(leftPanel, rightPanel);
            
            // LED light
            const ledGeom = new THREE.SphereGeometry(0.012, 8, 8);
            const ledMesh = new THREE.Mesh(ledGeom, ledMat);
            ledMesh.position.set(0, 0.045, 0);
            satGroup.add(ledMesh);
            
            // Trail setup
            const trailLength = 25;
            const trailGeom = new THREE.BufferGeometry();
            const trailPositions = new Float32Array(trailLength * 3);
            const trailColors = new Float32Array(trailLength * 3);
            
            const satRGB = new THREE.Color(data.color);
            for (let i = 0; i < trailLength; i++) {
                const ratio = i / trailLength;
                trailColors[i * 3] = satRGB.r * ratio * 0.8;
                trailColors[i * 3 + 1] = satRGB.g * ratio * 0.8;
                trailColors[i * 3 + 2] = satRGB.b * ratio * 0.8;
            }
            
            trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
            trailGeom.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
            
            const trailMat = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.7,
                linewidth: 1.5
            });
            
            const trailLine = new THREE.Line(trailGeom, trailMat);
            orbitGroup.add(trailLine);
            
            this.satellites.push({
                group: satGroup,
                distance: data.distance,
                speed: data.speed,
                angle: (index * Math.PI) / 2,
                orbitIndex: index,
                trailPositions: [],
                trailLength: trailLength,
                trailLine: trailLine,
                bodyMaterial: bodyMat,
                panelMaterial: panelMat,
                ledMaterial: ledMat,
                ledMesh: ledMesh
            });
        });
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.updateLayoutTargets();
        });
        
        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.paused = true;
            } else {
                this.paused = false;
                this.lastTime = performance.now();
            }
        });
    }
    
    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.width = width;
        this.height = height;
    }
    
    startAnimation() {
        this.paused = false;
        this.animate();
    }
    
    animate() {
        if (!this.paused) {
            this.frameCount++;
            this.update();
            this.render();
        }
        requestAnimationFrame(() => this.animate());
    }
    
    update() {
        // Rotate Earth globe locally
        if (this.globeGroup) {
            this.globeGroup.rotation.y += 0.0025;
        }
        
        // Smoothly interpolate globalOpacity (dimming feature: 1.0 on Home page, 0.04 on other pages)
        const targetOpacity = this.isHomePage ? 1.0 : 0.04;
        this.globalOpacity += (targetOpacity - this.globalOpacity) * 0.05;
        
        // Apply dimming to CSS-based background stars as well
        const starsContainer = document.querySelector('.stars');
        if (starsContainer) {
            starsContainer.style.opacity = this.globalOpacity;
            starsContainer.style.transition = 'opacity 0.5s ease';
        }
        
        // Twinkle stars (and apply dimming)
        if (this.starfield) {
            this.starfield.rotation.y += 0.0001;
            this.starfield.rotation.x += 0.00005;
            this.starfieldMaterial.opacity = (0.75 + Math.sin(this.frameCount * 0.03) * 0.15) * this.globalOpacity * 0.6;
        }
        
        // Apply dimming to Earth materials
        if (this.landMaterial) {
            this.landMaterial.opacity = 0.95 * this.globalOpacity;
        }
        if (this.oceanMaterial) {
            this.oceanMaterial.opacity = 0.3 * this.globalOpacity;
        }
        if (this.outlineMaterial) {
            this.outlineMaterial.opacity = 0.03 * this.globalOpacity;
        }
        
        // Apply dimming to orbit loops
        if (this.orbitRings) {
            this.orbitRings.forEach(ring => {
                ring.material.opacity = 0.12 * this.globalOpacity;
            });
        }
        
        // Smoothly interpolate parent systemGroup position (Earth + Satellites move together)
        const currentGlobeX = this.systemGroup.position.x;
        const diffX = this.targetGlobeX - currentGlobeX;
        this.systemGroup.position.x += diffX * 0.05;
        
        // Interpolate camera Z position
        const currentCamZ = this.camera.position.z;
        this.camera.position.z += (this.targetCameraZ - currentCamZ) * 0.05;
        
        // Smooth mouse parallax interpolation
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
        
        // Apply parallax to camera position offset
        this.camera.position.x = this.mouseX * 0.8;
        this.camera.position.y = this.mouseY * 0.6;
        this.camera.lookAt(new THREE.Vector3(this.systemGroup.position.x * 0.3, 0, 0));
        
        // Update Satellites
        this.updateSatellitesLogic();
    }
    
    updateSatellitesLogic() {
        this.satellites.forEach(sat => {
            sat.angle += sat.speed;
            
            sat.group.position.x = sat.distance * Math.cos(sat.angle);
            sat.group.position.y = sat.distance * Math.sin(sat.angle);
            sat.group.position.z = 0;
            
            sat.group.rotation.z = sat.angle + Math.PI / 2;
            
            // Apply dimming to satellite materials
            sat.bodyMaterial.opacity = this.globalOpacity;
            sat.panelMaterial.opacity = this.globalOpacity;
            sat.trailLine.material.opacity = 0.7 * this.globalOpacity;
            
            const ledBlink = Math.sin(this.frameCount * 0.1 + sat.orbitIndex) > 0;
            sat.ledMesh.material.color.setHex(ledBlink ? 0x00ff00 : 0x003300);
            sat.ledMaterial.opacity = ledBlink ? this.globalOpacity : 0.2 * this.globalOpacity;
            
            const localPos = sat.group.position;
            
            sat.trailPositions.push(localPos.clone());
            if (sat.trailPositions.length > sat.trailLength) {
                sat.trailPositions.shift();
            }
            
            const positionsAttr = sat.trailLine.geometry.attributes.position.array;
            const len = sat.trailPositions.length;
            
            for (let i = 0; i < sat.trailLength; i++) {
                const pos = sat.trailPositions[Math.min(i, len - 1)] || localPos;
                positionsAttr[i * 3] = pos.x;
                positionsAttr[i * 3 + 1] = pos.y;
                positionsAttr[i * 3 + 2] = pos.z;
            }
            sat.trailLine.geometry.attributes.position.needsUpdate = true;
        });
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

let animation;
window.addEventListener('load', () => {
    const checkHomePage = () => {
        const homeElement = document.getElementById('home');
        if (homeElement && animation) {
            animation.isHomePage = homeElement.classList.contains('active');
            animation.updateLayoutTargets();
        }
    };
    
    animation = new OptimizedSatelliteAnimation();
    checkHomePage(); // sync in case DOM changed between DOMContentLoaded and load

    const observer = new MutationObserver(checkHomePage);
    const homeElement = document.getElementById('home');
    if (homeElement) {
        observer.observe(homeElement, { attributes: true, attributeFilter: ['class'] });
    }
    
    document.querySelectorAll('.page').forEach(page => {
        observer.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
});