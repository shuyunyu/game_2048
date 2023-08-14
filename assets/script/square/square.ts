import { _decorator, Animation, Color, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Square')
export class Square extends Component {

    private _numberNode: Node = null;

    private _numberLabel: Label = null;

    private _animation: Animation = null;

    start () {
        this._numberNode = this.node.getChildByName('number');
        this._numberLabel = this._numberNode.getComponent(Label);
        this._numberNode.active = false;
        this._animation = this.node.getComponent(Animation);
    }

    public hideNumber () {
        this._numberNode.active = false;
    }

    public showNumber (val: number, color: Color = Color.WHITE) {
        this._numberLabel.string = String(val);
        this._numberLabel.color = color;
        if (!this._numberNode.active) this._numberNode.active = true;
    }

    public playAni () {
        this._animation.play('square');
    }

}

