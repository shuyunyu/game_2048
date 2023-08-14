import { _decorator, Component, instantiate, Layout, math, Node, Prefab } from 'cc';
import { Square } from '../square/square';
import { Cell, CellData, NumberConfig } from '../constant';
const { ccclass, property } = _decorator;

@ccclass('Grid')
export class Grid extends Component {

    @property(Prefab)
    public squarePrefab: Prefab = null;

    private _cellList: CellData[] = [];

    private _grid: boolean[][] = [];

    private _size = 4;

    start () {
        this._cellList = this.node.children.map(n => {
            const square = n.getComponent(Square);
            // square.hide();
            return {
                square: square,
                pos: n.worldPosition.clone()
            }
        });

        const layout = this.node.getComponent(Layout);
        layout.enabled = false;

        this.initGridData();
    }

    update (deltaTime: number) {

    }

    public newGrid () {
        this.generateSquares(2);
    }

    private initGridData () {
        for (let i = 0; i < this._size; i++) {
            const row = [];
            this._grid.push(row);
            for (let j = 0; j < this._size; j++) {
                row.push(false);
            }
        }
    }

    private generateSquares (count: number) {
        const emptyCells = this.findEmptyCells();
        const cells: Cell[] = [];
        let total = 0;
        while (emptyCells.length && total < count) {
            const index = math.randomRangeInt(0, emptyCells.length);
            const cell = emptyCells.splice(index, 1)[0];
            cells.push(cell!);
            total++;
        }
        const config = this.getLevelConfig(2);
        cells.forEach(cell => {
            const cellData = this._cellList[cell.row * this._size + cell.col];
            //create new square node
            //TODO USE NODE POOL
            const squareNode = instantiate(this.squarePrefab);
            const square = squareNode.getComponent(Square);
            squareNode.setParent(this.node);
            squareNode.setWorldPosition(cellData.pos);
            cellData.overSquare = square;
            this.updateCellState(cell, true);

            square.show(2, config.bgColor, config.fontColor);
            square.playAni("generate");
        });
    }

    private updateCellState (cell: Cell, flag: boolean) {
        this._grid[cell.row][cell.col] = flag;
    }

    private findEmptyCells () {
        const res: Cell[] = [];
        for (let i = 0; i < this._grid.length; i++) {
            const row = this._grid[i];
            for (let j = 0; j < row.length; j++) {
                const col = row[j];
                if (!col) {
                    res.push({
                        row: i,
                        col: j
                    })
                }
            }
        }
        return res;
    }

    private getLevelConfig (level: number) {
        const levelConfig = NumberConfig[String(level)];
        return levelConfig || NumberConfig["2048"];
    }

}

