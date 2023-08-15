import { Color, Vec3 } from "cc";
import { Square } from "./square/square";

export type LevelConfig = { bgColor: Color, fontColor: Color };

export const NumberConfig: Record<string, LevelConfig> = {
    "2": {
        bgColor: Color.fromHEX(new Color(), "#e9dccf"),
        fontColor: Color.BLACK.clone()
    },
    "4": {
        bgColor: Color.fromHEX(new Color(), "#e7b6d9"),
        fontColor: Color.BLACK.clone()
    },
    "8": {
        bgColor: Color.fromHEX(new Color(), "#f29e69"),
        fontColor: Color.WHITE.clone()
    },
    "16": {
        bgColor: Color.fromHEX(new Color(), "#ef7647"),
        fontColor: Color.WHITE.clone()
    },
    "32": {
        bgColor: Color.fromHEX(new Color(), "#ef5b45"),
        fontColor: Color.WHITE.clone()
    },
    "64": {
        bgColor: Color.fromHEX(new Color(), "#ee3d28"),
        fontColor: Color.WHITE.clone()
    },
    "128": {
        bgColor: Color.fromHEX(new Color(), "#e4bf54"),
        fontColor: Color.WHITE.clone()
    },
    "256": {
        bgColor: Color.fromHEX(new Color(), "#E7C34F"),
        fontColor: Color.WHITE.clone()
    },
    "512": {
        bgColor: Color.fromHEX(new Color(), "#E7C34F"),
        fontColor: Color.WHITE.clone()
    },
    "1024": {
        bgColor: Color.fromHEX(new Color(), "#C9963A"),
        fontColor: Color.WHITE.clone()
    },
    "2048": {
        bgColor: Color.fromHEX(new Color(), "#C2BC2F"),
        fontColor: Color.WHITE.clone()
    }
}

export type Cell = {
    row: number;
    col: number;
}

export type CellData = {
    square: Square;
    overSquare?: Square;
}

export enum MoveDirection {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right"
}