import { _decorator, Component, instantiate, Layout, math, Node, Prefab, size } from 'cc';
import { Square } from '../square/square';
import { Cell, CellData, MoveDirection, NumberConfig } from '../constant';
import { Log } from '../framework/log/log';
import { GenericEvent } from '../framework/event/generic-event';
import { PoolManager } from '../framework/pool/pool-manager';
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

type SnapshotData = {
    grid: {
        flag: boolean;
        value?: number;
    }[][];
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

    public cellBeforeMergeEvent: GenericEvent<any> = new GenericEvent();

    public cellMergedEvent: GenericEvent<number> = new GenericEvent();

    public filledEvent: GenericEvent<boolean> = new GenericEvent();

    private _snapshotData: SnapshotData = null;

    private _toSnapshotDone = false;

    public get snapshotData () {
        return this._snapshotData;
    }

    public get isMoving () {
        const movingSquare = this._cellList.find(cell => cell.overSquare && cell.overSquare.isMoving);
        return !!movingSquare;
    }

    start () {
        const layout = this.node.getComponent(Layout);
        layout.enabled = false;
    }

    private resetCellData () {
        this._cellList = this.node.children.map(n => {
            const square = n.getComponent(Square);
            return {
                square: square
            }
        });
    }

    private clearOverSquare () {
        this._cellList.forEach(cell => {
            if (cell.overSquare) {
                PoolManager.instance.putNode(cell.overSquare.node, this.squarePrefab);
            }
            cell.overSquare = null;
        });
    }

    public newGrid () {
        this._snapshotData = null;
        this._toSnapshotDone = false;
        this.clearOverSquare();
        this.resetCellData();
        this.initGridData();
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
        if (moveInfoList.length) {
            if (!this._toSnapshotDone) this.snapshot();
            this.cellBeforeMergeEvent.emit(null);
            this.doMoveCell(moveInfoList);
            Log.info(Grid.name, "moveInfo==>", moveInfoList);
        }

    }

    public toSnapshot () {
        if (this._snapshotData && !this._toSnapshotDone) {
            this.clearOverSquare();
            const grid = this._snapshotData.grid;
            for (let i = 0; i < grid.length; i++) {
                const row = grid[i];
                for (let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    this._grid[i][j] = cell.flag;
                    if (cell.flag) {
                        const cellData = this._cellList[i * this._size + j];
                        const squareNode = PoolManager.instance.getNode(this.squarePrefab, this.node);
                        const square = squareNode.getComponent(Square);
                        squareNode.setWorldPosition(cellData.square.node.worldPosition);
                        cellData.overSquare = square;
                        const config = this.getLevelConfig(cell.value);
                        square.show(cell.value, config.bgColor, config.fontColor);
                        square.playAni("generate");
                    }
                }
            }
            this._snapshotData = null;
            this._toSnapshotDone = true;
        }
    }

    private snapshot () {
        if (!this._snapshotData) {
            this._snapshotData = { grid: [] }
        }
        const grid = this._snapshotData.grid;
        for (let i = 0; i < this._size; i++) {
            if (!grid[i]) grid[i] = [];
            for (let j = 0; j < this._size; j++) {
                const flag = this._grid[i][j];
                if (flag) {
                    const index = i * this._size + j;
                    const value = this._cellList[index].overSquare.value;
                    grid[i][j] = {
                        flag: flag,
                        value: value
                    }
                } else {
                    grid[i][j] = {
                        flag: flag
                    }
                }
            }
        }
    }

    private doMoveCell (moveInfoList: MoveInfo[]) {
        let moveCount = moveInfoList.length;
        moveInfoList.forEach(moveInfo => {
            const toCellData = this._cellList[moveInfo.to.row * this._size + moveInfo.to.col];
            const targetSquare = toCellData.overSquare;
            const targetPos = toCellData.square.node.worldPosition;
            const fromCellData = this._cellList[moveInfo.from.row * this._size + moveInfo.from.col];
            const moveSquare = fromCellData.overSquare;

            moveSquare.moveTo(targetPos, this.moveSpeed * 0.1, () => {
                if (targetSquare && targetSquare.value === moveSquare.value) {
                    const newValue = targetSquare.value + moveSquare.value;
                    const config = this.getLevelConfig(newValue);
                    moveSquare.show(newValue, config.bgColor, config.fontColor);
                    moveSquare.playAni('merge');
                    PoolManager.instance.putNode(targetSquare.node, this.squarePrefab);
                    this.cellMergedEvent.emit(newValue);
                }
                moveCount--;
                if (moveCount === 0) {
                    this.checkFilled();
                }
            });

            //update grid flag
            this._grid[moveInfo.from.row][moveInfo.from.col] = false;
            this._grid[moveInfo.to.row][moveInfo.to.col] = true;
            //update cellData
            fromCellData.overSquare = null;
            toCellData.overSquare = moveSquare;

        })
        //generate new square
        this.generateSquares(1);

    }

    private initGridData () {
        this._grid.length = 0;
        for (let i = 0; i < this._size; i++) {
            const row = [];
            this._grid.push(row);
            for (let j = 0; j < this._size; j++) {
                row.push(false);
            }
        }
    }

    private checkFilled () {
        this.isFilled() && this.filledEvent.emit(true);
    }

    private isFilled () {
        if (!this.hasEmptyCells()) {
            for (let i = 0; i < this._size; i++) {
                for (let j = 0; j < this._size; j++) {
                    const left = { row: i, col: j - 1 };
                    const right = { row: i, col: j + 1 };
                    const up = { row: i - 1, col: j };
                    const bottom = { row: i + 1, col: j };
                    const equalIndexList = [left, right, up, bottom];
                    const index = i * this._size + j;
                    const value = this._cellList[index].overSquare.value;
                    for (let z = 0; z < equalIndexList.length; z++) {
                        const item = equalIndexList[z];
                        if (item.row >= 0 && item.row < this._size && item.col >= 0 && item.col < this._size) {
                            const eIndex = item.row * this._size + item.col;
                            const cellData = this._cellList[eIndex];
                            if (cellData && cellData.overSquare.value === value) {
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        }
        return false;
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
            const squareNode = PoolManager.instance.getNode(this.squarePrefab, this.node);
            const square = squareNode.getComponent(Square);
            squareNode.setWorldPosition(cellData.square.node.worldPosition);
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

    private hasEmptyCells () {
        for (let i = 0; i < this._grid.length; i++) {
            const row = this._grid[i];
            for (let j = 0; j < row.length; j++) {
                const flag = row[j];
                if (!flag) {
                    return true;
                }
            }
        }
        return false;
    }

    private getLevelConfig (level: number) {
        const levelConfig = NumberConfig[String(level)];
        return levelConfig || NumberConfig["2048"];
    }

}

