export declare const Role: {
    readonly USER: "USER";
    readonly ORGANIZER: "ORGANIZER";
    readonly ADMIN: "ADMIN";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const Category: {
    readonly Concert: "Concert";
    readonly Conference: "Conference";
    readonly Festival: "Festival";
    readonly Sport: "Sport";
    readonly Theatre: "Theatre";
    readonly Other: "Other";
};
export type Category = (typeof Category)[keyof typeof Category];
export declare const TicketStatus: {
    readonly VALID: "VALID";
    readonly USED: "USED";
    readonly CANCELLED: "CANCELLED";
};
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];
//# sourceMappingURL=enums.d.ts.map