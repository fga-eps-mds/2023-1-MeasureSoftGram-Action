export interface DefaultAttr {
    key: string;
    weight: number;
}

export interface Measure extends DefaultAttr {}

export interface Subcharacteristic extends DefaultAttr {
    measures: Array<Measure>
}

export interface Characteristic extends DefaultAttr {
    subcharacteristics: Array<Subcharacteristic>
}

export abstract class MSGConfig { 
        id: number;
        name: string;
        data: {characteristics: Array<Characteristic>};
        created_at: string;
        created_config: boolean;

    constructor(
        id: number,
        name: string,
        data: {characteristics: Array<Characteristic>},
        created_at: string,
        created_config: boolean) {

        this.id = id;
        this.name = name;
        this.data = data;
        this.created_at = created_at;
        this.created_config = created_config;
    }
}
