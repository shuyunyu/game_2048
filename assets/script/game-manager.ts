import { _decorator, Component, Label, Node, sys } from 'cc';
import { Grid } from './grid/grid';
import { InputManager } from './input/input-manager';
import { MoveDirection } from './constant';
import { Log } from './framework/log/log';
import { Utils } from './framework/utils/utils';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(Grid)
    public grid: Grid = null;

    @property(InputManager)
    public inputManager: InputManager = null;

    @property(Label)
    public scoreLabel: Label = null;

    @property(Label)
    public bestLable: Label = null;

    start () {
        this.init();
    }

    private init () {
        this.grid.newGrid();
        this.inputManager.moveEvent.addEventListener(this.onMove, this);
        this.grid.cellMergedEvent.addEventListener(this.onCellMerged, this);
        const best = Utils.defaultValue(sys.localStorage.getItem("best-score"), "0");
        this.bestLable.string = best;
    }

    private onMove (dir: MoveDirection) {
        Log.info(GameManager.name, "dir==>", dir);
        this.grid.moveCell(dir);
    }

    private onCellMerged (val: number) {
        const curScore = Number(this.scoreLabel.string);
        const score = curScore + val;
        this.scoreLabel.string = String(score);
        const best = Number(this.bestLable.string);
        if (score > best) {
            this.bestLable.string = String(score);
            sys.localStorage.setItem("best-score", this.bestLable.string);
        }
    }

    public onNewGame () {
        this.grid.newGrid();
        this.scoreLabel.string = "0";
    }

}

