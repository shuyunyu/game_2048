import { _decorator, Component, Node } from 'cc';
import { Grid } from './grid/grid';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(Grid)
    public grid: Grid = null;

    start () {
        this.init();
    }

    update (deltaTime: number) {

    }

    private init () {
        this.grid.newGrid();
    }

}

