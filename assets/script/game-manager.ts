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

    @property(Node)
    public gameoverRoot: Node = null;

    @property(Label)
    public gameoverScoreLabel: Label = null;

    @property(Node)
    public gamevictoryRoot: Node = null;

    private _skipMergedCheck = false;

    private _beforeScore: number = 0;

    start () {
        this.init();
    }

    private init () {
        this.gameoverRoot.active = false;
        this.gamevictoryRoot.active = false;
        this.grid.newGrid();
        this.inputManager.moveEvent.addEventListener(this.onMove, this);
        this.grid.cellBeforeMergeEvent.addEventListener(this.onCellBeforeMerge, this);
        this.grid.cellMergedEvent.addEventListener(this.onCellMerged, this);
        this.grid.filledEvent.addEventListener(this.onGridFilled, this);
        const best = Utils.defaultValue(sys.localStorage.getItem("best-score"), "0");
        this.bestLable.string = best;
    }

    private onMove (dir: MoveDirection) {
        Log.info(GameManager.name, "dir==>", dir);
        this.grid.moveCell(dir);
    }

    private onCellBeforeMerge () {
        this._beforeScore = Number(this.scoreLabel.string);
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
        if (val === 2048 && !this._skipMergedCheck) {
            if (this.inputManager.enabled) this.inputManager.enabled = false;
            this.gamevictoryRoot.active = true;
        }
    }

    public onGridFilled (filled: boolean) {
        if (this.inputManager.enabled) this.inputManager.enabled = false;
        this.gameoverScoreLabel.string = this.scoreLabel.string;
        this.gameoverRoot.active = true;
        Log.info(GameManager.name, "game over!");
    }

    public newGame () {
        if (!this.inputManager.enabled) this.inputManager.enabled = true;
        this.grid.newGrid();
        this.scoreLabel.string = "0";
        this._skipMergedCheck = false;
    }

    public restart () {
        this.gameoverRoot.active = false;
        this.gamevictoryRoot.active = false;
        this.newGame();
    }

    public continueGame () {
        if (!this.inputManager.enabled) this.inputManager.enabled = true;
        this.gamevictoryRoot.active = false;
        this._skipMergedCheck = true;
    }

    public toSnapshot () {
        if (this.grid.snapshotData) {
            this.grid.toSnapshot();
            this.scoreLabel.string = String(this._beforeScore);
        }
    }

}

