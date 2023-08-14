import { _decorator, Animation, Color, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

const HIDE_COLOR = new Color(255, 255, 255, 0);

@ccclass('Square')
export class Square extends Component {

    private _sprite: Sprite = null;

    private _numberNode: Node = null;

    private _numberLabel: Label = null;

    private _animation: Animation = null;

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

}

