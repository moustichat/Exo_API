import type { Request, Response } from "express";
export declare function getEvents(req: Request, res: Response): Promise<void>;
export declare function getEventById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createEvent(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=events.controller.d.ts.map