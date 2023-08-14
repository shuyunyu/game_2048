import { _decorator, Component, math, Node, Touch, Vec2 } from 'cc';
import { GenericEvent } from '../framework/event/generic-event';
import { MoveDirection } from '../constant';
const { ccclass, property } = _decorator;

@ccclass('InputManager')
export class InputManager extends Component {

    private _touchStarted = false;

    private _tempVec2 = new Vec2();

    public moveEvent: GenericEvent<MoveDirection> = new GenericEvent();

    start () {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    update (deltaTime: number) {

    }

    private onTouchStart (touch: Touch) {
        this._touchStarted = true;
    }

    private onTouchMove (touch: Touch) {
        const delta = touch.getDelta(this._tempVec2);
        if (this._touchStarted && delta.length()) {
            let dir: MoveDirection;
            if (delta.y === 0) {
                if (delta.x > 0) {
                    dir = MoveDirection.RIGHT;
                } else {
                    dir = MoveDirection.LEFT;
                }
            } else {
                const dirVal = delta.x / delta.y;

            }

            this._touchStarted = false;
            dir && this.moveEvent.emit(dir);
        }
    }

}

