import { Util } from '../libs/util';
import { Color } from 'three/src/math/Color';

export class Conf {
  private static _instance: Conf;

  // パラメータ
  public FLG_PARAM: boolean = location.href.includes('p=yes');
  public FLG_SHOW_MATTERJS: boolean = false;

  // Stats
  public FLG_STATS: boolean = location.href.includes('p=yes');

  // パス
  public PATH_IMG: string = './assets/img/';

  // タッチデバイス
  public USE_TOUCH: boolean = Util.instance.isTouchDevice();

  // ブレイクポイント
  public BREAKPOINT: number = 768;

  // PSDサイズ
  public LG_PSD_WIDTH: number = 1600;
  public XS_PSD_WIDTH: number = 750;

  // 簡易版
  public IS_SIMPLE: boolean = Util.instance.isPc() && Util.instance.isSafari();

  // スマホ
  public IS_PC: boolean = Util.instance.isPc();
  public IS_SP: boolean = Util.instance.isSp();
  public IS_AND: boolean = Util.instance.isAod();
  public IS_TAB: boolean = Util.instance.isIPad();
  public USE_ROLLOVER:boolean = Util.instance.isPc() && !Util.instance.isIPad()

  // ブラーかける画像のサイズ 0.3
  public BLUR_SCALE:number = this.IS_PC ? 0.1 : 0.1;

  public COLOR:Array<Color> = [
    new Color(0xf9fcfe),
    new Color(0xe50044),
    new Color(0xee7b00),
    new Color(0xffe100),
    new Color(0x00a161),
    new Color(0x0073b6),
    new Color(0x1c4fa1),
    new Color(0x673b93),
  ]

  constructor() {}
  public static get instance(): Conf {
    if (!this._instance) {
      this._instance = new Conf();
    }
    return this._instance;
  }
}
