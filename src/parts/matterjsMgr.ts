
import { Bodies, Body, Composite, Engine, Render, Runner, Composites, Constraint } from "matter-js";
import { Conf } from "../core/conf";
import { Func } from "../core/func";
import { MousePointer } from "../core/mousePointer";
import { MyObject3D } from "../webgl/myObject3D";

export class MatterjsMgr extends MyObject3D {

  public engine:Engine;
  public render:Render;

  private _runner:Runner;

  public lineBodies:Array<Array<Body>> = [];

  public mouse:Body;

  constructor() {
    super()

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    // エンジン
    this.engine = Engine.create();
    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0;

    // レンダラー
    this.render = Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        width: sw,
        height: sh,
        showAngleIndicator: false,
        showCollisions: false,
        showVelocity: false,
        pixelRatio:Conf.instance.FLG_SHOW_MATTERJS ? 1 : 0.1
      }
    });
    this.render.canvas.classList.add('l-matter');

    if(!Conf.instance.FLG_SHOW_MATTERJS) {
      this.render.canvas.classList.add('-hide');
    }

    this._makeLine(0);
    this._makeLine(1);
    this._makeLine(2);
    this._makeLine(3);

    const mouseSize = sw * Func.instance.val(0.2, 0.1);
    this.mouse = Bodies.circle(0, 0, mouseSize, {isStatic:true, render:{visible: Conf.instance.FLG_SHOW_MATTERJS}});
    Composite.add(this.engine.world, [
      this.mouse,
    ]);
    Body.setPosition(this.mouse, {x:9999, y:9999});

    this._runner = Runner.create();
    this.start();
    this._resize();
  }


  private _makeLine(v:number): void {
    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    const isYoko = (v == 0 || v == 2);

    const stiffness = 0.015;
    const bridgeNum = 10;
    const kake = 0.2;
    const bridgeSize = isYoko ? (sw / bridgeNum) * kake : (sh / bridgeNum) * kake;

    const bridge = Composites.stack(0, 0, bridgeNum, 1, 0, 0, (x:number, y:number) => {
      return Bodies.circle(x, y, bridgeSize, {
        collisionFilter: { group: Body.nextGroup(true) },
        friction: 0.9,
        render: {
          fillStyle: '#060a19',
          visible: Conf.instance.FLG_SHOW_MATTERJS
        }
      });
    });

    Composites.chain(bridge, 0, 0, 0, 0, {
      stiffness: stiffness,
      length: 2,
      render: {
        visible: Conf.instance.FLG_SHOW_MATTERJS
      }
    });

    const offsetX = sw * 0.5;
    const offsetY = sh * 0.5;

    let pAA = {x:0,y:0}
    let pAB = {x:0,y:0}
    if(v == 0) {
      pAA = { x: offsetX, y: offsetY };
      pAB = { x: sw - offsetX, y: offsetY };
    }
    if(v == 2) {
      pAA = { x: offsetX, y: sh - offsetY };
      pAB = { x: sw - offsetX, y: sh - offsetY};
    }
    if(v == 1) {
      pAA = { x: sw - offsetX, y: offsetY };
      pAB = { x: sw - offsetX, y: sh - offsetY };
    }
    if(v == 3) {
      pAA = { x: offsetX, y: offsetY };
      pAB = { x: offsetX, y: sh - offsetY };
    }

    Composite.add(this.engine.world, [
      bridge,
      Constraint.create({
          pointA: pAA,
          bodyB: bridge.bodies[0],
          pointB: { x: 0, y: 0 },
          length: 1,
          stiffness: 1
      }),
      Constraint.create({
          pointA: pAB,
          bodyB: bridge.bodies[bridge.bodies.length - 1],
          pointB: { x: 0, y: 0 },
          length: 1,
          stiffness: 1
      })
    ]);

    // Bodyだけ入れておく
    const size = isYoko ? (sw / bridgeNum) : (sh / bridgeNum);
    this.lineBodies.push([]);
    const lineKey = this.lineBodies.length - 1;
    bridge.bodies.forEach((b,i) => {
      if(v == 0) {
        Body.setPosition(b, {x:size * i, y:0});
      }
      if(v == 2) {
        Body.setPosition(b, {x:size * i, y:sh});
      }

      if(v == 1) {
        Body.setPosition(b, {x:sw, y:size * i});
      }
      if(v == 3) {
        Body.setPosition(b, {x:0, y:size * i});
      }

      this.lineBodies[lineKey].push(b);
    })
  }


  public start(): void {
    Render.run(this.render);
    Runner.run(this._runner, this.engine);
  }


  public stop(): void {
    Render.stop(this.render);
    Runner.stop(this._runner);
  }




  // ---------------------------------
  // 更新
  // ---------------------------------
  protected _update():void {
    super._update();

    let mx = MousePointer.instance.x;
    let my = MousePointer.instance.y;

    // this.engine.gravity.x = MousePointer.instance.easeNormal.x * 0.5;
    this.engine.gravity.y = MousePointer.instance.easeNormal.y;
    this.engine.gravity.x = MousePointer.instance.easeNormal.x;

    if(Conf.instance.USE_TOUCH && MousePointer.instance.isDown == false) {
      mx = 9999
      my = 9999
    }

    // my = (Update.instance.cnt * 15) % Func.instance.sh()

    Body.setPosition(this.mouse, {x:mx, y:my});
  }


  protected _resize(): void {
    super._resize();

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    this.render.canvas.width = sw;
    this.render.canvas.height = sh;
  }
}