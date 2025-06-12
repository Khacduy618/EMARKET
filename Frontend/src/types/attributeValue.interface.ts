export interface AttributeValue {
    AttributeValueID: number;
    AttributeID: number;
    Value: string;
    attribute: {
        AttributeID: number;
        Name: string;
    };
}
