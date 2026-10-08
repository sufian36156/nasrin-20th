/**
 * ====================================================================
 * 💎 THREE.JS 3D PHOTO HEART CONTROLLER (หัวใจ 3D มวลรวมภาพความทรงจำ)
 * ====================================================================
 */

class Heart3DController {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.heartGroup = null;
        this.cards = [];
        this.particles = null;
        this.animFrame = null;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.targetRotX = 0;
        this.targetRotY = 0;
        this.currentRotX = 0;
        this.currentRotY = 0;
        this.lastTapTime = 0;
        this.isExploding = false;
        this.isInitialized = false;
    }

    init() {
        this.container = document.getElementById('heart3d-webgl-container');
    }

    start() {
        this.container = document.getElementById('heart3d-webgl-container');
        if (!this.container) return;

        this.isExploding = false;
        this.targetRotX = 0;
        this.targetRotY = 0;
        this.currentRotX = 0;
        this.currentRotY = 0;
        this.velRotX = 0;
        this.velRotY = 0;

        // 🎵 สลับเพลงเฉพาะสำหรับหน้าหัวใจความทรงจำ 3D (Memory Waltz 3D)
        if (window.musicController) {
            window.musicController.startHeart3D(0.38);
        }

        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.initThreeScene();
        this.setupInteraction();
        this.animate();
    }

    initThreeScene() {
        this.container.innerHTML = '';
        this.cards = [];

        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. Scene & Camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.camera.position.z = 12;

        // 2. Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 3. Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
        this.scene.add(ambientLight);

        const pinkLight = new THREE.PointLight(0xff3366, 2, 50);
        pinkLight.position.set(5, 5, 8);
        this.scene.add(pinkLight);

        const goldLight = new THREE.PointLight(0xffd700, 1.8, 50);
        goldLight.position.set(-5, -5, 8);
        this.scene.add(goldLight);

        // 4. Heart Group
        this.heartGroup = new THREE.Group();
        this.scene.add(this.heartGroup);

        // 5. Create 12 3D Photo Mesh Cards
        this.createPhotoCards();

        // 6. Floating Starlight Halo Particles
        this.createHeartParticleHalo();

        // Resize handler
        window.addEventListener('resize', () => {
            if (!this.camera || !this.renderer) return;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createPhotoCards() {
        const photos = window.HBD_CONFIG.heart3dPhotos || [];
        const count = 12;

        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;

            // Parametric 3D Heart Curve coordinates
            const x = 16 * Math.pow(Math.sin(t), 3) * 0.22;
            const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.22;
            const z = Math.sin(t * 2) * 0.9;

            const imgSrc = photos[i] || 'assets/images/polaroids/1.jpeg';
            const texture = this.createCardTexture(imgSrc, i + 1);

            const geometry = new THREE.PlaneGeometry(1.8, 2.3);
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                side: THREE.DoubleSide,
                roughness: 0.3,
                metalness: 0.2
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);

            // Orient card to face slightly outward
            mesh.lookAt(x * 2, y * 2, z * 2 + 5);

            mesh.userData = {
                basePos: new THREE.Vector3(x, y, z),
                velocity: new THREE.Vector3(),
                rotSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                )
            };

            this.heartGroup.add(mesh);
            this.cards.push(mesh);
        }
    }

    createCardTexture(imagePath, index) {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 380;
        const ctx = canvas.getContext('2d');

        // Elegant gold & white photo frame
        ctx.fillStyle = '#ffffff';
        this.roundRect(ctx, 4, 4, 292, 372, 16);
        ctx.fill();

        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 4;
        this.roundRect(ctx, 8, 8, 284, 364, 14);
        ctx.stroke();

        // Caption at bottom
        ctx.fillStyle = '#8c6d33';
        ctx.font = 'bold 16px Prompt, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Nasrin Memory #${index}`, 150, 355);

        const texture = new THREE.CanvasTexture(canvas);

        // Load image into canvas texture
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imagePath;
        img.onload = () => {
            // Draw photo inside frame
            ctx.save();
            this.roundRect(ctx, 16, 16, 268, 310, 10);
            ctx.clip();
            ctx.drawImage(img, 16, 16, 268, 310);
            ctx.restore();
            texture.needsUpdate = true;
        };
        img.onerror = () => {
            // Fallback gradient photo
            const grad = ctx.createLinearGradient(16, 16, 284, 326);
            grad.addColorStop(0, '#ff758f');
            grad.addColorStop(1, '#ff4d6d');
            ctx.fillStyle = grad;
            this.roundRect(ctx, 16, 16, 268, 310, 10);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px Mitr, sans-serif';
            ctx.fillText('💖', 150, 180);
            texture.needsUpdate = true;
        };

        return texture;
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    createHeartParticleHalo() {
        const particleCount = 280;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0xff3366);
        const color2 = new THREE.Color(0xffd700);

        for (let i = 0; i < particleCount; i++) {
            const t = Math.random() * Math.PI * 2;
            const spread = (Math.random() - 0.5) * 1.5;

            const x = (16 * Math.pow(Math.sin(t), 3) * 0.26) + spread;
            const y = ((13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * 0.26) + spread;
            const z = (Math.random() - 0.5) * 3.5;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            const c = Math.random() > 0.5 ? color1 : color2;
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.12,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.heartGroup.add(this.particles);
    }

    setupInteraction() {
        let lastMoveX = 0;
        let lastMoveY = 0;

        const onStart = (e) => {
            if (this.isExploding) return;
            this.isDragging = true;
            this.velRotX = 0;
            this.velRotY = 0;

            const pt = e.touches ? e.touches[0] : e;
            this.startX = pt.clientX;
            this.startY = pt.clientY;
            lastMoveX = pt.clientX;
            lastMoveY = pt.clientY;

            // Double tap detection
            const now = Date.now();
            if (now - this.lastTapTime < 380) {
                this.explodeHeart();
            }
            this.lastTapTime = now;
        };

        const onMove = (e) => {
            if (!this.isDragging || this.isExploding) return;
            const pt = e.touches ? e.touches[0] : e;
            const deltaX = pt.clientX - this.startX;
            const deltaY = pt.clientY - this.startY;

            // คำนวณความเร็วเฉื่อย (Inertia Velocity)
            this.velRotY = (pt.clientX - lastMoveX) * 0.0035;
            this.velRotX = (pt.clientY - lastMoveY) * 0.0035;

            this.targetRotY += deltaX * 0.007;
            this.targetRotX += deltaY * 0.007;

            // ลิมิตมุมก้มเงยแกน X ให้อยู่ในช่วงที่มองเห็นสวยงาม
            this.targetRotX = Math.max(-0.8, Math.min(0.8, this.targetRotX));

            this.startX = pt.clientX;
            this.startY = pt.clientY;
            lastMoveX = pt.clientX;
            lastMoveY = pt.clientY;

            if (e.cancelable && e.type.startsWith('touch')) {
                e.preventDefault();
            }
        };

        const onEnd = () => {
            this.isDragging = false;
        };

        // Touch & Pointer events
        this.container.addEventListener('pointerdown', onStart, { passive: false });
        window.addEventListener('pointermove', onMove, { passive: false });
        window.addEventListener('pointerup', onEnd);
        window.addEventListener('pointercancel', onEnd);

        this.container.addEventListener('touchstart', onStart, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
    }

    explodeHeart() {
        if (this.isExploding) return;
        this.isExploding = true;

        window.soundManager.playPop(350);
        window.soundManager.playVictory();

        if (window.confetti) {
            window.confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
        }

        // Set outward explosion velocities for each card
        this.cards.forEach(card => {
            const dir = card.position.clone().normalize();
            card.userData.velocity = dir.multiplyScalar(0.25 + Math.random() * 0.2);
        });

        const hint = document.getElementById('heart3d-hint');
        if (hint) {
            hint.textContent = '💥 หัวใจแห่งความทรงจำแตกกระจาย... ก้าวสู่ลูกโป่ง 20 ปี! 🎈';
        }

        // Transition to 20 Balloons scene with warp effect
        setTimeout(() => {
            if (this.animFrame) cancelAnimationFrame(this.animFrame);
            if (window.app) {
                window.app.goToCeremonyScene('scene-balloons', true, '🎈 สายลมแห่งความหวัง...', 'ปล่อยลูกโป่งความทรงจำ 20 ปี 🌟', () => {
                    if (window.balloons3D) window.balloons3D.start();
                });
            } else {
                if (window.balloons3D) window.balloons3D.start();
            }
        }, 1400);
    }

    animate() {
        if (!this.renderer || !this.scene || !this.camera) return;

        // Smooth damping rotation + momentum
        if (!this.isDragging && !this.isExploding) {
            this.targetRotY += this.velRotY;
            this.targetRotX += this.velRotX;
            this.velRotY *= 0.94; // แรงเสียดทานหนืดนุ่ม
            this.velRotX *= 0.94;

            // Idle gentle floating
            this.targetRotY += 0.0035;
        }

        // Smooth interpolation
        this.currentRotX += (this.targetRotX - this.currentRotX) * 0.12;
        this.currentRotY += (this.targetRotY - this.currentRotY) * 0.12;

        if (this.heartGroup) {
            this.heartGroup.rotation.x = this.currentRotX;
            this.heartGroup.rotation.y = this.currentRotY;
        }

        if (this.isExploding) {
            // Animate cards bursting outward
            this.cards.forEach(card => {
                card.position.add(card.userData.velocity);
                card.rotation.x += card.userData.rotSpeed.x * 2;
                card.rotation.y += card.userData.rotSpeed.y * 2;
                card.rotation.z += card.userData.rotSpeed.z * 2;
                card.scale.multiplyScalar(0.97);
            });

            if (this.particles) {
                this.particles.scale.multiplyScalar(1.05);
                this.particles.material.opacity *= 0.95;
            }
        }

        this.renderer.render(this.scene, this.camera);
        this.animFrame = requestAnimationFrame(() => this.animate());
    }
}

window.heart3D = new Heart3DController();
