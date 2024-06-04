export interface Label {
    id: string;
    name: string;
    begin: number;
    end: number;
    successor:successor|null,
    children:string[]
}

export interface successor{
    id:string,
    junctor:string|null
}

