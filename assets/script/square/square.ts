import { _decorator, Animation, Color, Component, Label, Node, Sprite, Tween, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

const HIDE_COLOR = new Color(255, 255, 255, 0);

@ccclass('Square')
export class Square extends Component {

    private _sprite: Sprite = null;

    private _numberNode: Node = null;

    private _numberLabel: Label = null;

    private _animation: Animation = null;

    private _tween: Tween<Node> = null;

    public get isMoving () {
        return !!this._tween;
    }

    public get value () {
        return Number(this._numberLabel.string);
    }

    onLoad () {
        this._sprite = this.node.getComponent(Sprite);
        this._numberNode = this.node.getChildByName('number');
        this._numberLabel = this._numberNode.getComponent(Label);
        this._numberNode.active = false;
        this._animation = this.node.getComponent(Animation);
    }

    public hide () {
        this._sprite.color = HIDE_COLOR;
        this._numberNode.active = false;
    }

    public show (val: number, spriteColor: Color, fontColor: Color = Color.WHITE) {
        this._sprite.color = spriteColor;
        this._numberLabel.string = String(val);
        this._numberLabel.color = fontColor;
        if (!this._numberNode.active) this._numberNode.active = true;
    }

    public playAni (name: "generate" | "merge") {
        this._animation.play(name);
    }

    public moveTo (target: Vec3, duration: number = 0.2, cb: () => void | null = null) {
        this._tween = new Tween(this.node).to(duration, {
            worldPosition: target
        }, {
            onComplete: () => {
                cb && cb();
                this._tween = null;
            }
        }).start();
    }

}

