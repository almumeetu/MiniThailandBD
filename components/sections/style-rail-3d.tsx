"use client";

import { useEffect, useRef } from "react";
import type * as Three from "three";
import type { ShopProduct } from "@/lib/shop-api";
import { getProductFallbackImage } from "@/lib/admin-api";
import styles from "./storefront-style-rail.module.css";

interface Props {
  products: ShopProduct[];
  selectedIndex: number;
  onPick: (index: number) => void;
  onReady: (ready: boolean) => void;
}

export default function StyleRail3D({ products, selectedIndex, onPick, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef(selectedIndex);
  const pickRef = useRef(onPick);

  useEffect(() => { selectionRef.current = selectedIndex; }, [selectedIndex]);
  useEffect(() => { pickRef.current = onPick; }, [onPick]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let release: (() => void) | undefined;
    onReady(false);

    async function createScene() {
      const [T, { RoomEnvironment }] = await Promise.all([
        import("three"),
        import("three/addons/environments/RoomEnvironment.js"),
      ]);
      if (cancelled || !host) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.04;
      renderer.setClearColor(0xf8fafb, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);
      release = () => { renderer.dispose(); renderer.domElement.remove(); };

      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(38, 1, 0.1, 60);
      const environment = new RoomEnvironment();
      const pmrem = new T.PMREMGenerator(renderer);
      const envTarget = pmrem.fromScene(environment, 0.04);
      scene.environment = envTarget.texture;
      scene.environmentIntensity = 0.65;
      environment.dispose();
      pmrem.dispose();

      scene.add(new T.HemisphereLight(0xffffff, 0xa5b2c0, 1.2));
      const key = new T.DirectionalLight(0xfffaf4, 3);
      key.position.set(-4, 8, 5);
      key.target.position.set(0, 1, 0);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -17;
      key.shadow.camera.right = 17;
      key.shadow.camera.top = 7;
      key.shadow.camera.bottom = -1;
      key.shadow.camera.near = 0.5;
      key.shadow.camera.far = 18;
      key.shadow.camera.updateProjectionMatrix();
      key.shadow.bias = -0.0002;
      key.shadow.radius = 5;
      scene.add(key, key.target);
      const fill = new T.DirectionalLight(0xdce9ff, 0.7);
      fill.position.set(5, 4, -2);
      scene.add(fill);
      const floor = new T.Mesh(
        new T.PlaneGeometry(42, 24),
        new T.MeshStandardMaterial({ color: 0xe8e0d5, roughness: 0.88, metalness: 0.02 }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.015;
      floor.receiveShadow = true;
      scene.add(floor);

      // Fine painted-wood grain is shared by the slim, beveled hanger frames.
      const woodCanvas = document.createElement("canvas");
      woodCanvas.width = 512;
      woodCanvas.height = 128;
      const woodContext = woodCanvas.getContext("2d")!;
      woodContext.fillStyle = "#ffffff";
      woodContext.fillRect(0, 0, 512, 128);
      for (let row = 0; row < 128; row += 2) {
        woodContext.strokeStyle = `rgba(0,0,0,${0.05 + (Math.sin(row * 1.7) + 1) * 0.045})`;
        woodContext.lineWidth = 0.6 + (row % 3) * 0.3;
        woodContext.beginPath();
        woodContext.moveTo(0, row);
        for (let x = 0; x <= 512; x += 8) woodContext.lineTo(x, row + Math.sin(x * 0.021 + row) * 2.5);
        woodContext.stroke();
      }
      const woodTexture = new T.CanvasTexture(woodCanvas);
      woodTexture.colorSpace = T.SRGBColorSpace;
      woodTexture.wrapS = woodTexture.wrapT = T.RepeatWrapping;
      woodTexture.repeat.set(1, 3);
      const theme = getComputedStyle(host);
      const themePrimary = theme.getPropertyValue("--color-store-primary").trim() || "#174a76";
      const themeDeep = theme.getPropertyValue("--color-store-deep").trim() || "#142638";
      const hangerMaterial = new T.MeshStandardMaterial({ map: woodTexture, color: themePrimary, roughness: 0.48, metalness: 0.08 });
      const chrome = new T.MeshStandardMaterial({ color: 0xc4c9c7, metalness: 1, roughness: 0.2, envMapIntensity: 1.5 });
      const trim = new T.MeshStandardMaterial({ color: themeDeep, metalness: 0.65, roughness: 0.3 });
      const rail = new T.Mesh(new T.CylinderGeometry(0.047, 0.047, 32, 40), chrome);
      rail.rotation.z = Math.PI / 2;
      rail.position.y = 4.04;
      rail.castShadow = true;
      scene.add(rail);
      for (const x of [-7.6, 7.6]) {
        const post = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 4.04, 24), chrome);
        post.position.set(x, 2.02, 0);
        post.castShadow = true;
        scene.add(post);
        const foot = new T.Mesh(new T.CylinderGeometry(0.24, 0.29, 0.055, 32), chrome);
        foot.position.set(x, 0.028, 0);
        foot.castShadow = true;
        scene.add(foot);
      }

      const shape = new T.Shape();
      shape.moveTo(0, -0.3);
      shape.quadraticCurveTo(-0.08, -0.3, -0.2, -0.36);
      shape.lineTo(-0.95, -0.68);
      shape.quadraticCurveTo(-1.05, -0.73, -0.96, -0.83);
      shape.lineTo(0.96, -0.83);
      shape.quadraticCurveTo(1.05, -0.73, 0.95, -0.68);
      shape.lineTo(0.2, -0.36);
      shape.quadraticCurveTo(0.08, -0.3, 0, -0.3);
      const hole = new T.Path();
      hole.moveTo(0, -0.375);
      hole.lineTo(0.84, -0.73);
      hole.lineTo(0.84, -0.765);
      hole.lineTo(-0.84, -0.765);
      hole.lineTo(-0.84, -0.73);
      hole.closePath();
      shape.holes.push(hole);
      const shoulderGeometry = new T.ExtrudeGeometry(shape, { depth: 0.055, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.012, bevelThickness: 0.012, curveSegments: 20 });
      shoulderGeometry.translate(0, 0, -0.0275);
      const hookCurve = new T.CatmullRomCurve3([
        new T.Vector3(0, -0.31, 0), new T.Vector3(0, -0.1, 0),
        new T.Vector3(0.11, -0.01, 0.025), new T.Vector3(0.14, 0.13, 0.035),
        new T.Vector3(0.05, 0.24, 0.015), new T.Vector3(-0.075, 0.22, -0.015),
        new T.Vector3(-0.13, 0.12, -0.025),
      ]);
      const hookGeometry = new T.TubeGeometry(hookCurve, 48, 0.012, 10, false);
      const clipGeometry = new T.BoxGeometry(0.075, 0.13, 0.06);
      const pictureFrameShape = new T.Shape();
      pictureFrameShape.moveTo(-0.55, -0.55);
      pictureFrameShape.lineTo(0.55, -0.55);
      pictureFrameShape.lineTo(0.55, 0.55);
      pictureFrameShape.lineTo(-0.55, 0.55);
      pictureFrameShape.closePath();
      const pictureFrameOpening = new T.Path();
      pictureFrameOpening.moveTo(-0.5, -0.5);
      pictureFrameOpening.lineTo(-0.5, 0.5);
      pictureFrameOpening.lineTo(0.5, 0.5);
      pictureFrameOpening.lineTo(0.5, -0.5);
      pictureFrameOpening.closePath();
      pictureFrameShape.holes.push(pictureFrameOpening);
      const pictureFrameGeometry = new T.ExtrudeGeometry(pictureFrameShape, {
        depth: 0.055,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.008,
        bevelThickness: 0.008,
      });
      pictureFrameGeometry.translate(0, 0, -0.0275);
      const loader = new T.TextureLoader();
      const textures = new Set<Three.Texture>([woodTexture]);
      const items: { group: Three.Group; index: number; lastOffset: number; velocity: number; ensureImage: () => void }[] = [];

      products.forEach((product, index) => {
        const group = new T.Group();
        group.userData.index = index;
        group.position.y = 3.8;
        const frame = new T.Mesh(shoulderGeometry, hangerMaterial);
        frame.castShadow = true;
        group.add(frame);
        const hook = new T.Mesh(hookGeometry, chrome);
        hook.castShadow = true;
        group.add(hook);
        const collar = new T.Mesh(new T.CylinderGeometry(0.032, 0.032, 0.045, 20), trim);
        collar.position.y = -0.29;
        collar.castShadow = true;
        group.add(collar);
        for (const x of [-0.61, 0.61]) {
          const clip = new T.Mesh(clipGeometry, trim);
          clip.position.set(x, -0.87, 0.055);
          clip.castShadow = true;
          group.add(clip);
        }

        const imageMaterial = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.78, metalness: 0, side: T.DoubleSide });
        const picture = new T.Mesh(new T.PlaneGeometry(1, 1), imageMaterial);
        const framePlate = new T.Mesh(
          pictureFrameGeometry,
          new T.MeshStandardMaterial({ color: 0xa78c61, metalness: 0.55, roughness: 0.32 }),
        );
        const backing = new T.Mesh(
          new T.BoxGeometry(1, 1, 0.028),
          new T.MeshStandardMaterial({ color: 0xe5d9c7, roughness: 0.76 }),
        );
        picture.position.z = 0.062;
        backing.position.z = 0.041;
        framePlate.castShadow = true;
        backing.castShadow = true;
        group.add(framePlate, backing, picture);
        function sizePicture(width: number, height: number) {
          const aspect = width / height;
          const photoWidth = Math.min(1.66, 1.94 * aspect);
          const photoHeight = photoWidth / aspect;
          picture.scale.set(photoWidth, photoHeight, 1);
          backing.scale.set(photoWidth + 0.045, photoHeight + 0.045, 1);
          framePlate.scale.set(photoWidth, photoHeight, 1);
          picture.position.y = backing.position.y = framePlate.position.y = -0.96 - photoHeight / 2;
        }
        sizePicture(4, 5);
        function loadPhoto(url: string, fallback = false) {
          const texture = loader.load(url, () => {
            if (cancelled) { texture.dispose(); return; }
            texture.colorSpace = T.SRGBColorSpace;
            texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
            imageMaterial.map = texture;
            imageMaterial.needsUpdate = true;
            const image = texture.image as HTMLImageElement;
            sizePicture(image.naturalWidth || image.width, image.naturalHeight || image.height);
          }, undefined, () => {
            if (!cancelled && !fallback) loadPhoto(getProductFallbackImage(product.name, product.category), true);
          });
          textures.add(texture);
        }
        let photoRequested = false;
        const ensureImage = () => {
          if (photoRequested) return;
          photoRequested = true;
          loadPhoto(product.image || getProductFallbackImage(product.name, product.category));
        };
        scene.add(group);
        items.push({ group, index, lastOffset: Number.NaN, velocity: 0, ensureImage });
      });

      let cameraDistance = 7.5;
      let visibleRange = 3;
      let slotSpacing = 1.95;
      function resize() {
        if (!host) return;
        const width = Math.max(host.clientWidth, 1);
        const height = Math.max(host.clientHeight, 1);
        const mobile = width < 600;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.fov = mobile ? 36 : 38;
        visibleRange = mobile ? 1 : width < 1000 ? 2 : 3;
        slotSpacing = mobile ? 1.85 : 1.95;
        const sceneWidth = mobile ? (width < 360 ? 4.2 : 4.8) : width < 1000 ? 8.8 : 14.6;
        cameraDistance = Math.max(6.8, sceneWidth / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
        camera.updateProjectionMatrix();
      }
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();
      let visible = true;
      const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "100px" });
      visibilityObserver.observe(host);
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const finePointer = window.matchMedia("(pointer: fine)");
      const pointer = new T.Vector2();
      const targetRotation = new T.Quaternion();
      const targetEuler = new T.Euler();
      const raycaster = new T.Raycaster();
      let hoveredIndex = -1;
      let pointerDown: { x: number; y: number } | null = null;
      const itemAtPointer = () => {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(items.filter(item => item.group.visible).map(item => item.group), true)[0];
        if (!hit) return -1;
        let target: Three.Object3D | null = hit.object;
        while (target && typeof target.userData.index !== "number") target = target.parent;
        return target ? target.userData.index as number : -1;
      };
      const updatePointer = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
        hoveredIndex = itemAtPointer();
        renderer.domElement.style.cursor = hoveredIndex >= 0 ? "pointer" : "grab";
      };
      const down = (event: PointerEvent) => { pointerDown = { x: event.clientX, y: event.clientY }; };
      const up = (event: PointerEvent) => {
        const start = pointerDown;
        pointerDown = null;
        if (!start) return;
        const travelX = event.clientX - start.x;
        const travelY = event.clientY - start.y;
        if (Math.hypot(travelX, travelY) > 9) {
          if (products.length > 1 && event.pointerType !== "touch" && Math.abs(travelX) > 45 && Math.abs(travelX) > Math.abs(travelY)) {
            pickRef.current((selectionRef.current + (travelX < 0 ? 1 : -1) + products.length) % products.length);
          }
          return;
        }
        updatePointer(event);
        if (hoveredIndex >= 0) pickRef.current(hoveredIndex);
      };
      const leave = () => {
        pointer.set(0, 0);
        pointerDown = null;
        hoveredIndex = -1;
        renderer.domElement.style.cursor = "grab";
      };
      host.addEventListener("pointermove", updatePointer);
      host.addEventListener("pointerdown", down);
      host.addEventListener("pointerup", up);
      host.addEventListener("pointerleave", leave);
      let frameId = 0;
      let lastTime = 0;
      let contextAvailable = true;
      const contextLost = () => {
        contextAvailable = false;
        onReady(false);
      };
      renderer.domElement.addEventListener("webglcontextlost", contextLost);
      function animate(time: number) {
        if (cancelled) return;
        frameId = requestAnimationFrame(animate);
        const delta = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;
        if (!visible || !contextAvailable || document.visibilityState === "hidden") return;
        const blend = motion.matches ? 1 : 1 - Math.exp(-delta * 7);
        for (const item of items) {
          let offset = (item.index - selectionRef.current + products.length) % products.length;
          if (offset > products.length / 2) offset -= products.length;
          const jump = !Number.isFinite(item.lastOffset) || Math.abs(item.lastOffset - offset) > products.length / 2;
          item.group.visible = Math.abs(offset) <= visibleRange;
          if (Math.abs(offset) <= visibleRange + 1) item.ensureImage();
          const targetX = offset * slotSpacing;
          const hovering = !motion.matches && item.index === hoveredIndex;
          const hoverAmount = hovering ? 1 : 0;
          const yaw = (offset === 0 ? 0 : -Math.sign(offset) * (0.82 + Math.min(Math.abs(offset), 3) * 0.08))
            - (hovering ? pointer.x * 0.12 : 0);
          const previousX = item.group.position.x;
          item.group.position.x = jump ? targetX : T.MathUtils.lerp(previousX, targetX, blend);
          const targetY = 3.8 + hoverAmount * 0.11;
          item.group.position.y = T.MathUtils.lerp(item.group.position.y, targetY, blend);
          const targetScale = 1 + hoverAmount * 0.055;
          item.group.scale.setScalar(T.MathUtils.lerp(item.group.scale.x, targetScale, blend));
          const speed = (item.group.position.x - previousX) / Math.max(delta, 0.001);
          item.velocity = jump || motion.matches ? 0 : T.MathUtils.lerp(item.velocity, speed, blend);
          const swing = motion.matches ? 0 : T.MathUtils.clamp(-item.velocity * 0.012, -0.035, 0.035) + Math.sin(time * 0.0008 + item.index * 0.7) * 0.004;
          targetEuler.set(hovering ? pointer.y * 0.035 : 0, yaw, swing);
          targetRotation.setFromEuler(targetEuler);
          if (jump || motion.matches) item.group.quaternion.copy(targetRotation);
          else item.group.quaternion.slerp(targetRotation, blend);
          item.lastOffset = offset;
        }
        const parallax = motion.matches || !finePointer.matches ? 0 : 1;
        camera.position.x = T.MathUtils.lerp(camera.position.x, pointer.x * 0.16 * parallax, blend * 0.5);
        camera.position.y = T.MathUtils.lerp(camera.position.y || 2.25, 2.25 + pointer.y * 0.07 * parallax, blend * 0.5);
        camera.position.z = cameraDistance;
        camera.lookAt(0, 2, 0);
        renderer.render(scene, camera);
      }
      animate(0);
      onReady(true);

      release = () => {
        cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        host.removeEventListener("pointermove", updatePointer);
        host.removeEventListener("pointerdown", down);
        host.removeEventListener("pointerup", up);
        host.removeEventListener("pointerleave", leave);
        renderer.domElement.removeEventListener("webglcontextlost", contextLost);
        const geometries = new Set<Three.BufferGeometry>();
        const materials = new Set<Three.Material>();
        scene.traverse(object => {
          if (object instanceof T.Mesh) {
            geometries.add(object.geometry);
            (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
          }
        });
        geometries.forEach(geometry => geometry.dispose());
        materials.forEach(material => material.dispose());
        textures.forEach(texture => texture.dispose());
        envTarget.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }
    createScene().catch(() => { release?.(); if (!cancelled) onReady(false); });
    return () => { cancelled = true; release?.(); };
  }, [products, onReady]);

  return <div ref={hostRef} className={styles.webglStage} />;
}
