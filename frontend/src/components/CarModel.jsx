import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CarModel = ({ collisionType }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();

    const car = createCar(collisionType);
    scene.add(car);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(200, 500, 300);
    scene.add(dirLight);

    const aspectRatio = window.innerWidth / window.innerHeight;
    const cameraWidth = 150;
    const cameraHeight = cameraWidth / aspectRatio;
    const camera = new THREE.OrthographicCamera(
      cameraWidth / -2,
      cameraWidth / 2,
      cameraHeight / 2,
      cameraHeight / -2,
      0,
      1000
    );
    camera.position.set(200, 200, 200);
    camera.lookAt(0, 10, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.6);
    renderer.render(scene, camera);

    renderer.setAnimationLoop(() => {
      car.rotation.y -= 0.007;
      renderer.render(scene, camera);
    });

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [collisionType]);

  function createCar(collisionType) {
    const car = new THREE.Group();

    const backWheel = createWheels();
    backWheel.position.y = 6;
    backWheel.position.x = -18;
    car.add(backWheel);

    const frontWheel = createWheels();
    frontWheel.position.y = 6;
    frontWheel.position.x = 18;
    car.add(frontWheel);

    const main = new THREE.Mesh(
      new THREE.BoxGeometry(60, 15, 30),
      [
        new THREE.MeshLambertMaterial({
          color: collisionType === 'Front' ? 0xff0000 : 0x666666,
        }), 
        new THREE.MeshLambertMaterial({
          color: collisionType === 'Rear' ? 0xff0000 : 0x666666,
        }), 
        new THREE.MeshLambertMaterial({ color: 0x666666 }), 
        new THREE.MeshLambertMaterial({ color: 0x666666 }), 
        new THREE.MeshLambertMaterial({
          color: collisionType === 'Side' ? 0xff0000 : 0x666666,
        }), 
        new THREE.MeshLambertMaterial({
          color: collisionType === 'Side' ? 0xff0000 : 0x666666,
        }), 
      ]
    );
    main.position.y = 12;
    car.add(main);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(33, 12, 24),
      [
        new THREE.MeshLambertMaterial({ map: getCarFrontTexture() }), 
        new THREE.MeshLambertMaterial({ map: getCarFrontTexture() }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }), 
        new THREE.MeshLambertMaterial({ color: 0xffffff }), 
        new THREE.MeshLambertMaterial({ map: getCarSideTexture() }), 
        new THREE.MeshLambertMaterial({ map: getCarSideTexture() }), 
      ]
    );
    cabin.position.x = -6;
    cabin.position.y = 25.5;
    car.add(cabin);

    return car;
  }

  function createWheels() {
    const geometry = new THREE.BoxGeometry(12, 12, 33);
    const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const wheel = new THREE.Mesh(geometry, material);
    return wheel;
  }

  function getCarFrontTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 64, 32);
    context.fillStyle = '#666666';
    context.fillRect(8, 8, 48, 24);
    return new THREE.CanvasTexture(canvas);
  }

  function getCarSideTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 128, 32);
    context.fillStyle = '#666666';
    context.fillRect(10, 8, 38, 24);
    context.fillRect(58, 8, 60, 24);
    return new THREE.CanvasTexture(canvas);
  }

  return <div ref={mountRef} />;
};

export default CarModel;
