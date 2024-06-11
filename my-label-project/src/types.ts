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

export interface Condition {
    id: string;
    variable: string;
    condition: string;
}

export interface Expected {
    id: string;
    variable: string;
    condition: string;
}

export interface Case {
    [key: string]: boolean;
}

interface Suite {
    conditions: Condition[];
    expected: Expected[];
    cases: Case[];
}

export interface JsonData {
    suite: Suite;
}
