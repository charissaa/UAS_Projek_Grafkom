import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Environment {
  // CONSTRUCTOR
  constructor(scene, fisik) {
    this.scene = scene;
    this.fisik = fisik;
    this._loadModel();
  }

  // LOAD MODEL
  _loadModel() {
    const loader = new GLTFLoader();
    loader.setPath('./resources/environment/');
    loader.load(
      'scene.gltf',
      (gltf) => {
        gltf.scene.traverse((child) => {
          child.castShadow = true;
          child.receiveShadow = true;

          var lokasi = new THREE.Vector3();
          child.getWorldPosition(lokasi);
          this.fisik.createBox(0, lokasi, new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
        });
        this.scene.add(gltf.scene);
        this._addStreetLights(gltf.scene);
        this._addMoonLight(gltf.scene);
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );
  }

  // ADD MOON LIGHT
  _addMoonLight(scene) {
    var moon_geometry = new THREE.SphereGeometry(1, 10, 10);
    var moon_material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    var moon = new THREE.Mesh(moon_geometry, moon_material);
    moon.position.set(-7, 15, -6);
    moon.scale.set(2, 2, 2);
    moon.castShadow = true;
    moon.receiveShadow = true;
    scene.add(moon);

    // AMBIENT LIGHT
    var ambientLight = new THREE.AmbientLight(0x404040, 10);
    scene.add(ambientLight);
  }

  // ADD STREET LIGHTS
  _addStreetLights(scene) {
    // POINT LIGHT
    // var light1 = new THREE.PointLight(0xffff11, 8.5, 10, 1); //warna, radius,
    // light1.position.set(12.062029270512683, -0.018463847852750733 + 0.3, -5.749309104455958);
    // light1.castShadow = true;
    // scene.add(light1);

    var light2 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    light2.position.set(15.08508267063462, -0.018463847852751396 + 0.3, 2.8189764469794762);
    light2.castShadow = true;
    scene.add(light2);

    var light3 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    light3.position.set(10.21556434685965, -0.018463847852751396 + 0.3, 3.843360299457251);
    light3.castShadow = true;
    scene.add(light3);

    var light4 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    light4.position.set(7.546712477802203, -0.018463847852751396 + 0.3, 3.8292077725688993);
    light4.castShadow = true;
    scene.add(light4);

    var light5 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    light5.position.set(9.620220121885382, -0.018463847852751396 + 0.3, 0.9424777243577813);
    light5.castShadow = true;
    scene.add(light5);

    // var light6 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    // light6.position.set(10.259734878098925, -0.018463847852751396 + 0.3, -4.381050425218273);
    // light6.castShadow = true;
    // scene.add(light6);

    // var light7 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    // light7.position.set(8.893621017032387, -0.018463847852751396 + 0.3, -1.0989955927634372);
    // light7.castShadow = true;
    // scene.add(light7);

    // var light8 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    // light8.position.set(10.427231212245715, -0.018463847852751396 + 0.3, -3.0314523385864374);
    // light8.castShadow = true;
    // scene.add(light8);

    // var light9 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    // light9.position.set(-1.4969926348132294, -0.018463847852447347 + 0.3, 13.29661245537716);
    // light9.castShadow = true;
    // scene.add(light9);

    // var light10 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    // light10.position.set(-1.6542365658081337, -0.018463847852751396 + 0.3, 10.407287621837202);
    // light10.castShadow = true;
    // scene.add(light10);

    var light11 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    light11.position.set(-10.772775638115945, -0.018463847852751396 + 0.5, 7.91493715217913);
    light11.castShadow = true;
    scene.add(light11);

    var light12 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    light12.position.set(-10.756396243950803, -0.018463847852751396 + 0.5, 9.077874776951486);
    light12.castShadow = true;
    scene.add(light12);

    // var light13 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    // light13.position.set(7.762711008130509, -0.018463847852751396 + 0.5, 8.122762470044817);
    // light13.castShadow = true;
    // scene.add(light13);

    // var light14 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    // light14.position.set(3.9756798427772537, -0.018463847852751396 + 0.5, 7.154181535177167);
    // light14.castShadow = true;
    // scene.add(light14);

    var light15 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    light15.position.set(10.244041519074699, -0.018463847852751396 + 0.5, 8.166069354911064);
    light15.castShadow = true;
    scene.add(light15);

    var light16 = new THREE.PointLight(0xffff11, 8.5, 10, 1);
    light16.position.set(10.477409433780394, -0.018463847852751396 + 0.5, 12.025990018176323);
    light16.castShadow = true;
    scene.add(light16);

    // POINT LIGHT HELPER
    // var helper1 = new THREE.PointLightHelper(light3, light3.radius);
    // scene.add(helper1);
  }
}
