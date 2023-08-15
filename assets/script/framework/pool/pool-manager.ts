import { NodePool, Prefab, instantiate, Node } from "cc";

interface IDictPool {
    [uuid: string]: NodePool;
}

interface IDictPrefab {
    [uuid: string]: Prefab;
}

export class PoolManager {

    public static get instance () {
        if (!this._instance) {
            this._instance = new PoolManager();
        }
        return this._instance;
    }

    private _dictPool: IDictPool = {};
    private _dictPrefab: IDictPrefab = {};
    private static _instance: PoolManager;


    private constructor () {

    }

    public getNode (prefab: Prefab, parent: Node) {
        let uuid = prefab.uuid;
        let node: Node = null;
        this._dictPrefab[uuid] = prefab;
        const pool = this._dictPool[uuid];
        if (pool) {
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                node = instantiate(prefab);
            }
        } else {
            this._dictPool[uuid] = new NodePool();
            node = instantiate(prefab);
        }

        node.parent = parent;
        node.active = true;
        return node;
    }

    public putNode (node: Node, prefab: Prefab) {
        let uuid = prefab.uuid;
        node.parent = null;
        if (!this._dictPool[uuid]) {
            this._dictPool[uuid] = new NodePool();
        }

        this._dictPool[uuid].put(node);
    }
}