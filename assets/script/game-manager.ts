import { _decorator, Component, Node } from 'cc';
import { Grid } from './grid/grid';
import { InputManager } from './input/input-manager';
import { MoveDirection } from './constant';
import { Log } from './framework/log/log';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(Grid)
    public grid: Grid = null;

    @property(InputManager)
    public inputManager: InputManager = null;

    start () {
        this.init();
    }

    update (deltaTime: number) {

    }

    private init () {
        this.grid.newGrid();
        this.inputManager.moveEvent.addEventListener(this.onMove, this);
    }

    private onMove (dir: MoveDirection) {
        Log.info(GameManager.name, "dir==>", dir);
        this.grid.moveCell(dir);
    }

}

