import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export class PlayerControllerProxy {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
}

export class PlayerController {
  constructor(params) {
    this._Init(params);
  }

  _Init(params) {
    this._params = params;
    this._decceletation = new THREE.Vector3(-0.002, -0.0004, -20.0);
    this.acceleration = new THREE.Vector3(0.25, 0.0625, 12.5);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this._position = new THREE.Vector3();

    this._animations = {};
    this._input = new PlayerControllerInput();
    this._stateMachine = new CharacterFSM(new PlayerControllerProxy(this._animations));

    this._loadModel();
  }

  _loadModel() {
    const loader = new FBXLoader();
    loader.setPath('./resources/player/');
    loader.load('character.fbx', (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse((child) => {
        child.castShadow = true;
        child.receiveShadow = true;
      });
      fbx.scale.set(0.005, 0.005, 0.005);

      this._target = fbx;
      this._params.scene.add(this._target);

      this._mixer = new THREE.AnimationMixer(this._target);

      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.SetState('idle');
      };

      const _onLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);
        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader(this._manager);
      loader.setPath('./resources/player/');
      loader.load('idle.fbx', (a) => {
        _onLoad('idle', a);
      });
      loader.load('walk.fbx', (a) => {
        _onLoad('walk', a);
      });
    });
  }

  get Position() {
    return this._position;
  }

  get Rotation() {
    if (!this._target) {
      return new THREE.Quaternion();
    }
    return this._target.quaternion;
  }

  Update(timeInSeconds) {
    if (!this._target) {
      return;
    }

    this._stateMachine.Update(timeInSeconds, this._input);

    const velocity = this.velocity;
    const frameDecceleration = new THREE.Vector3(velocity.x * this._decceletation.x, velocity.y * this._decceletation.y, velocity.z * this._decceletation.z);
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this.acceleration.clone();

    if (this._input._keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this._input._keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this.acceleration.y);
      _R.multiply(_Q);
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this.acceleration.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    const newPosition = controlObject.position.clone().add(forward).add(sideways);//
    controlObject.position.copy(newPosition);//
    this._position.copy(controlObject.position);

    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }

    // Ensure collision detection logic is implemented
    if (checkCollision(newPosition)) {
      // Handle collision
    }
  }
}

export class PlayerControllerInput {
  constructor() {
    this._Init();
  }

  _Init() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // W
        this._keys.forward = true;
        break;
      case 83: // S
        this._keys.backward = true;
        break;
      case 65: // A
        this._keys.left = true;
        break;
      case 68: // D
        this._keys.right = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch (event.keyCode) {
      case 87: // W
        this._keys.forward = false;
        break;
      case 83: // S
        this._keys.backward = false;
        break;
      case 65: // A
        this._keys.left = false;
        break;
      case 68: // D
        this._keys.right = false;
        break;
    }
  }
}

export class FiniteStateMachine {
  constructor() {
    this._states = {};
    this._currentState = null;
  }

  _addState(name, type) {
    this._states[name] = type;
  }

  SetState(name) {
    const prevState = this._currentState;

    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = new this._states[name](this);

    this._currentState = state;
    state.Enter(prevState);
  }

  Update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.Update(timeElapsed, input);
    }
  }
}

export class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._Init();
  }

  _Init() {
    this._addState('idle', IdleState);
    this._addState('walk', WalkState);
  }
}

export class State {
  constructor(parent) {
    this._parent = parent;
  }

  Enter() {}

  Exit() {}

  Update() {}
}

export class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'idle';
  }

  Enter(prevState) {
    const idleAction = this._parent._proxy._animations['idle'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.2, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  Exit() {}

  Update(_, input) {
    if (input._keys.forward || input._keys.backward) {
      this._parent.SetState('walk');
    }
  }
}

export class WalkState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'walk';
  }

  Enter(prevState) {
    const walkAction = this._parent._proxy._animations['walk'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      walkAction.time = 0.0;
      walkAction.enabled = true;
      walkAction.setEffectiveTimeScale(1.0);
      walkAction.setEffectiveWeight(1.0);
      walkAction.crossFadeFrom(prevAction, 0.2, true);
      walkAction.play();
    } else {
      walkAction.play();
    }
  }

  Exit() {}

  Update(timeElapsed, input) {
    if (input._keys.forward || input._keys.backward) {
      return;
    }
    this._parent.SetState('idle');
  }
}
