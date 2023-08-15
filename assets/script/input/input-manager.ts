import { _decorator, Component, EventKeyboard, Input, input, KeyCode, math, Node, Touch, Vec2 } from 'cc';
import { GenericEvent } from '../framework/event/generic-event';
import { MoveDirection } from '../constant';
const { ccclass, property } = _decorator;

const tempVec2_1 = new Vec2();
const tempVec2_2 = new Vec2();

@ccclass('InputManager')
export class InputManager extends Component {

    public moveEvent: GenericEvent<MoveDirection> = new GenericEvent();

    private _startLocation: Vec2 = null;

    private _interval = 0.05;

    private _curInterval = 0;

    onEnable () {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDisable () {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this._startLocation = null;
        this._curInterval = 0;
    }

    update (deltaTime: number) {
        if (this._startLocation) {
            this._curInterval += deltaTime;
        }
    }

    private onTouchStart (touch: Touch) {
        this._startLocation = touch.getLocation(tempVec2_1);
    }

    private onKeyDown (event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ARROW_UP:
                this.moveEvent.emit(MoveDirection.UP);
                break;
            case KeyCode.ARROW_DOWN:
                this.moveEvent.emit(MoveDirection.DOWN);
                break;
            case KeyCode.ARROW_LEFT:
                this.moveEvent.emit(MoveDirection.LEFT);
                break;
            case KeyCode.ARROW_RIGHT:
                this.moveEvent.emit(MoveDirection.RIGHT);
                break;
            default:
                break;
        }
    }

    private onTouchMove (touch: Touch) {
        if (this._startLocation && this._curInterval >= this._interval) {
            const location = touch.getLocation(tempVec2_2);
            const delta = location.subtract(this._startLocation).normalize();

            if (delta.length()) {
                let dir: MoveDirection;
                const angle = math.toDegree(Vec2.angle(delta, Vec2.UNIT_X));
                if (angle <= 45) {
                    dir = MoveDirection.RIGHT;
                } else if (angle >= 135) {
                    dir = MoveDirection.LEFT;
                } else {
                    if (delta.y > 0) {
                        dir = MoveDirection.UP;
                    } else {
                        dir = MoveDirection.DOWN;
                    }
                }


                this._startLocation = null;
                this._curInterval = 0;
                dir && this.moveEvent.emit(dir);
            }

        }
    }

}

