import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { Environment } from './environment.js';
import { PlayerController } from './player.js';
import { RigidBody } from './collision.js';

class Main {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    // SETUP AMMO
    this.collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
    this.dispatcher_ = new Ammo.btCollisionDispatcher(this.collisionConfiguration_);
    this.broadphase_ = new Ammo.btDbvtBroadphase();
    this.solver_ = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld_ = new Ammo.btDiscreteDynamicsWorld(this.dispatcher_, this.broadphase_, this.solver_, this.collisionConfiguration_);
    this.physicsWorld_.setGravity(new Ammo.btVector3(0, -10, 0));

    // SETUP SCENE
    this._scene = new THREE.Scene();

    // SETUP CAMERA
    this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.set(0, 4, 25);

    // SETUP RENDERER
    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.setClearColor(0x000000);
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.VSMShadowMap;
    document.body.appendChild(this._renderer.domElement);

    // SETUP CLOCK
    this._clock = new THREE.Clock();

    // SETUP RESIZE EVENT
    window.addEventListener(
      'resize',
      () => {
        this._OnWindowResize();
      },
      false
    );

    // SETUP ORBIT CONTROLS
    this._orbitControls = new OrbitControls(this._camera, this._renderer.domElement);
    this._orbitControls.enableDamping = true;
    this._orbitControls.dampingFactor = 0.05;
    this._orbitControls.enableZoom = true;
    const target = this._orbitControls.target;
    this._orbitControls.enabled = false;

    // SETUP TRACKBALL CONTROLS
    this._trackballControls = new TrackballControls(this._camera, this._renderer.domElement);
    this._trackballControls.noRotate = true;
    this._trackballControls.noPan = true;
    this._trackballControls.noZoom = false;
    this._trackballControls.zoomSpeed = 1.0;
    this._trackballControls.target = target;
    this._trackballControls.enabled = false;

    // SETUP FREE ROAM CAMERA
    this.controls = new FirstPersonControls(this._camera, this._renderer.domElement);
    this.controls.lookSpeed = 0.1;
    this.controls.movementSpeed = 5;
    this.controls.enabled = true;

    this.fisikEnv = new RigidBody();

    // SETUP ENVIRONMENT
    this._environment = new Environment(this._scene, this.fisikEnv);

    this.physicsWorld_.addRigidBody(this.fisikEnv.body_);

    this.fisikPlayer = new RigidBody();

    // SETUP PLAYER
    this._loadPlayer();

    this.fisikPlayer.createBox(1, this._player.Position, this._player.Rotation, new THREE.Vector3(1, 1, 1));
    this.physicsWorld_.addRigidBody(this.fisikPlayer.body_);

    this.rigidBodies_ = [{ mesh: this._player, rigidBody: this.fisikPlayer }];
    this.tmpTransform_ = new Ammo.btTransform();

    // SETUP SWITCH CAMERA
    this._switchCamera();

    this._RAF();
  }

  _loadPlayer() {
    const params = {
      camera: this._camera,
      scene: this._scene,
    };
    this._player = new PlayerController(params);
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      if (this.controls.enabled) {
        this.controls.update(this._clock.getDelta());
      } else if (this._orbitControls.enabled && this._trackballControls.enabled) {
        this._orbitControls.update();
        this._trackballControls.update();
      }
      this._Step(t - this._previousRAF);
      this._renderer.render(this._scene, this._camera);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map((m) => m.update(timeElapsedS));
    }

    if (this._player && this._orbitControls.enabled && this._trackballControls.enabled) {
      this._player.Update(timeElapsedS);

      const playerPos = this._player.Position;
      this._orbitControls.target.copy(playerPos);
      this.fisikPlayer.transform_.setOrigin(new Ammo.btVector3(playerPos.x, playerPos.y, playerPos.z));
      this.fisikPlayer.transform_.setRotation(new Ammo.btQuaternion(this._player.Rotation.x, this._player.Rotation.y, this._player.Rotation.z, this._player.Rotation.w));
      this.fisikPlayer.motionState_.setWorldTransform(this.fisikPlayer.transform_);
      this.fisikPlayer.body_.setMotionState(this.fisikPlayer.motionState_);
    }

    this.physicsWorld_.stepSimulation(timeElapsedS, 10);

    // for (let i = 0; i < this.rigidBodies_.length; ++i) {
    //   this.rigidBodies_[i].rigidBody.motionState_.getWorldTransform(this.tmpTransform_);
    //   const pos = this.tmpTransform_.getOrigin();
    //   const quat = this.tmpTransform_.getRotation();
    //   const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
    //   const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());

    //   // this.rigidBodies_[i].mesh.Position.copy(pos3);
    //   // this.rigidBodies_[i].mesh.Rotation.copy(quat3);

    //   pos3.copy(this.rigidBodies_[i].mesh.Position);
    //   quat3.copy(this.rigidBodies_[i].mesh.Rotation);
    // }
  }

  _switchCamera() {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'c') {
        this._toggleControls();
      }
    });
  }

  _toggleControls() {
    if (this.controls.enabled) {
      this.controls.enabled = false;
      this._orbitControls.enabled = true;
      this._trackballControls.enabled = true;
    } else {
      this._orbitControls.enabled = false;
      this._trackballControls.enabled = false;
      this.controls.enabled = true;
    }
  }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  Ammo().then((lib) => {
    Ammo = lib;
    _APP = new Main();
  });
});
