
import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Update } from '../libs/update';
import { MatterjsMgr } from './matterjsMgr';
import { Mesh } from 'three/src/objects/Mesh';
import { CircleGeometry } from 'three/src/geometries/CircleGeometry';
// import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { Vector3 } from 'three/src/math/Vector3';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
// import { Param } from "../core/param";
import { Capture } from "../webgl/capture";
import { Blur } from "../webgl/blur";
import { OrthographicCamera } from 'three/src/cameras/OrthographicCamera';
import { Conf } from "../core/conf";
import { Texture } from "three/src/textures/Texture";
import { Util } from "../libs/util";
import { MousePointer } from "../core/mousePointer";
import { Item } from "./item";
import { Tween } from '../core/tween';
import { Point } from '../libs/point';


export class Visual extends Canvas {

  private _con:Object3D;
  private _conDest:Object3D;
  private _matterjs:MatterjsMgr;
  private _item:Array<Array<any>> = [];

  private _blurCap:Capture;
  private _blur:Array<Blur> = [];
  private _blurCamera:OrthographicCamera;

  private _dest:Array<Item> = [];

  private _hoverText:HTMLElement;
  private _hoverTextPos:Point = new Point();
  // private _isHover:boolean = false;

  constructor(opt: any) {
    super(opt);

    this._hoverText = document.querySelector('.l-text span') as HTMLElement;
    // this._hoverText.addEventListener('mouseenter', () => {
    //   this._isHover = true;
    // })
    // this._hoverText.addEventListener('mouseleave', () => {
    //   this._isHover = false;
    // })

    this._matterjs = opt.matterjs;

    this._con = new Object3D();

    this._conDest = new Object3D();
    this.mainScene.add(this._conDest);

    this._blurCap = new Capture();
    this._blurCap.add(this._con);

    this._blurCamera = this._makeOrthCamera()
    this._updateOrthCamera(this._blurCamera, 10, 10)

    for(let i = 0; i < 3; i++) {
      const b = new Blur()
      this._blur.push(b)
    }

    const geo = new CircleGeometry(0.5, 32);
    // const geo = new PlaneGeometry(1, 1);

    this._matterjs.lineBodies.forEach((val,i) => {
      this._item.push([])
      val.forEach(() => {
        const mesh = new Mesh(
          geo,
          new MeshBasicMaterial({
            color: 0xffffff,
            transparent:true,
            depthTest:false,
          })
        )
        this._con.add(mesh);

        this._item[i].push({
          mesh:mesh,
          noise:new Vector3(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1))
        });
      })
    })

    const num = 20;
    for(let i = 0; i < num; i++) {
      const dest = new Item({
        tex:this._blur[this._blur.length - 1].getTexture()
      })
      this._conDest.add(dest);
      this._dest.push(dest);
    }

    this._resize()
  }


  protected _update(): void {
    super._update()

    this._conDest.position.y = Func.instance.screenOffsetY() * -1;

    const sw = Func.instance.sw()
    const sh = Func.instance.sh()

    const b = this._matterjs.lineBodies[0];
    const bridgeSize = (sw / b.length) * 0.15;

    this._matterjs.lineBodies.forEach((val,i) => {
      val.forEach((val2,l) => {
        let bodyX = val2.position.x - sw * 0.5
        let bodyY = val2.position.y * -1 + sh * 0.5

        const item = this._item[i][l];
        const mesh = item.mesh;
        mesh.position.x = bodyX;
        mesh.position.y = bodyY;

        const noise = item.noise;

        const size = bridgeSize * Func.instance.val(1.5, 1);
        mesh.scale.set(size * Util.instance.mix(2, 5, noise.x), size * Util.instance.mix(2, 5, noise.y), 1);
      })
    })

    const destSize = 1;
    this._conDest.scale.set(destSize, destSize, destSize);

    const zureX = MousePointer.instance.easeNormal.x * 10
    const zureY = MousePointer.instance.easeNormal.y * 10

    const txtKake = 10;
    let tgTxtX = zureX * 1 * txtKake;
    let tgTxtY = zureY * 1 * txtKake;

    // if(!this._isHover) {
    //   tgTxtX = tgTxtY = 0;
    // }
    this._hoverTextPos.x += (tgTxtX - this._hoverTextPos.x) * 0.5;
    this._hoverTextPos.y += (tgTxtY - this._hoverTextPos.y) * 0.5;
    Tween.instance.set(this._hoverText, {
      x:this._hoverTextPos.x,
      y:this._hoverTextPos.y
    })

    this._dest.forEach((val,i) => {
      val.scale.set(sw, sh, 1);
      val.position.x = i * zureX
      val.position.y = i * zureY
    })

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    // ブラー適応
    this.renderer.setClearColor(0x000000, 0)
    this._blurCap.render(this.renderer, this.cameraPers);
    const bw = this.renderSize.width * Conf.instance.BLUR_SCALE
    const bh = this.renderSize.height * Conf.instance.BLUR_SCALE
    this._blur.forEach((val,i) => {
        const t:Texture = i == 0 ? this._blurCap.texture() : this._blur[i-1].getTexture()
        val.render(bw, bh, t, this.renderer, this._blurCamera, 100)
    })

    this.renderer.setClearColor(0xffffff, 0)
    this.renderer.render(this.mainScene, this.cameraPers);
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 2 == 0
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    // this._updateOrthCamera(this.cameraOrth, w, h);
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this._blurCap.setSize(w, h, pixelRatio)
    this._updateOrthCamera(this._blurCamera, w * Conf.instance.BLUR_SCALE, h * Conf.instance.BLUR_SCALE)

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }
}
