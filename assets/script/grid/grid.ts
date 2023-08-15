import { _decorator, Component, instantiate, Layout, math, Node, Prefab } from 'cc';
import { Square } from '../square/square';
import { Cell, CellData, MoveDirection, NumberConfig } from '../constant';
import { Log } from '../framework/log/log';
const { ccclass, property } = _decorator;

type MoveInfo = {
    from: {
        row: number,
        col: number;
    },
    to: {
        row: number,
        col: number
    }
}

@ccclass('Grid')
export class Grid extends Component {

    @property(Prefab)
    public squarePrefab: Prefab = null;

    @property
    public moveSpeed: number = 1;

    private _cellList: CellData[] = [];

    //row col
    private _grid: boolean[][] = [];

    private _size = 4;

    public get isMoving () {
        const movingSquare = this._cellList.find(cell => cell.overSquare && cell.overSquare.isMoving);
        return !!movingSquare;
    }

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

    public moveCell (dir: MoveDirection) {
        if (this.isMoving) return;
        const moveInfoList: MoveInfo[] = [];
        if (dir === MoveDirection.RIGHT) {
            for (let i = 0; i < this._size; i++) {
                let maxIndex = this._size - 1;
                const valueStack: number[] = [];
                for (let j = this._size - 1; j >= 0; j--) {
                    const flag = this._grid[i][j];
                    if (flag) {
                        let cellVal = this._cellList[i * this._size + j].overSquare.value;
                        const nearValue = valueStack[valueStack.length - 1];
                        let index = maxIndex;
                        if (cellVal === nearValue) {
                            cellVal = -1; //确保不会被再次合并
                            index = ++maxIndex;
                        }
                        if (index !== j) moveInfoList.push({
                            from: {
                                row: i,
                                col: j
                            },
                            to: {
                                row: i,
                                col: index
                            }
                        });
                        valueStack.push(cellVal);
                        maxIndex--;
                    }
                }
            }
        } else if (dir === MoveDirection.LEFT) {
            for (let i = 0; i < this._size; i++) {
                let minIndex = 0;
                const valueStack: number[] = [];
                for (let j = 0; j < this._size; j++) {
                    const flag = this._grid[i][j];
                    if (flag) {
                        let cellVal = this._cellList[i * this._size + j].overSquare.value;
                        const nearValue = valueStack[valueStack.length - 1];
                        let index = minIndex;
                        if (cellVal === nearValue) {
                            cellVal = -1; //确保不会被再次合并
                            index = --minIndex;
                        }
                        if (j !== index) moveInfoList.push({
                            from: {
                                row: i,
                                col: j
                            },
                            to: {
                                row: i,
                                col: index
                            }
                        });
                        valueStack.push(cellVal);
                        minIndex++;
                    }
                }
            }
        } else if (dir === MoveDirection.UP) {
            for (let i = 0; i < this._size; i++) {
                let minIndex = 0;
                const valueStack: number[] = [];
                for (let j = 0; j < this._size; j++) {
                    const flag = this._grid[j][i];
                    if (flag) {
                        let cellVal = this._cellList[j * this._size + i].overSquare.value;
                        const nearValue = valueStack[valueStack.length - 1];
                        let index = minIndex;
                        if (cellVal === nearValue) {
                            cellVal = -1; //确保不会被再次合并
                            index = --minIndex;
                        }
                        if (j !== index) moveInfoList.push({
                            from: {
                                row: j,
                                col: i
                            },
                            to: {
                                row: index,
                                col: i
                            }
                        });
                        valueStack.push(cellVal);
                        minIndex++;
                    }
                }
            }
        } else if (dir === MoveDirection.DOWN) {
            for (let i = 0; i < this._size; i++) {
                let maxIndex = this._size - 1;
                const valueStack: number[] = [];
                for (let j = this._size - 1; j >= 0; j--) {
                    const flag = this._grid[j][i];
                    if (flag) {
                        let cellVal = this._cellList[j * this._size + i].overSquare.value;
                        const nearValue = valueStack[valueStack.length - 1];
                        let index = maxIndex;
                        if (cellVal === nearValue) {
                            cellVal = -1; //确保不会被再次合并
                            index = ++maxIndex;
                        }
                        if (j !== index) moveInfoList.push({
                            from: {
                                row: j,
                                col: i
                            },
                            to: {
                                row: index,
                                col: i
                            }
                        });
                        valueStack.push(cellVal);
                        maxIndex--;
                    }
                }
            }
        }
        this.doMoveCell(moveInfoList);
        Log.info(Grid.name, "moveInfo==>", moveInfoList);
    }

    private doMoveCell (moveInfoList: MoveInfo[]) {
        let moved = false;
        moveInfoList.forEach(moveInfo => {
            const toCellData = this._cellList[moveInfo.to.row * this._size + moveInfo.to.col];
            const targetSquare = toCellData.overSquare;
            const targetPos = toCellData.pos;
            const fromCellData = this._cellList[moveInfo.from.row * this._size + moveInfo.from.col];
            const moveSquare = fromCellData.overSquare;

            moveSquare.moveTo(targetPos, this.moveSpeed * 0.1, () => {
                if (targetSquare && targetSquare.value === moveSquare.value) {
                    const newValue = targetSquare.value + moveSquare.value;
                    const config = this.getLevelConfig(newValue);
                    moveSquare.show(newValue, config.bgColor, config.fontColor);
                    moveSquare.playAni('merge');
                    targetSquare.node.destroy();
                }

            });

            //update grid flag
            this._grid[moveInfo.from.row][moveInfo.from.col] = false;
            this._grid[moveInfo.to.row][moveInfo.to.col] = true;
            //update cellData
            fromCellData.overSquare = null;
            toCellData.overSquare = moveSquare;

            moved = true;
        })
        //generate new square
        moved && this.generateSquares(1);
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

