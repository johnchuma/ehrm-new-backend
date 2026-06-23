import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): Observable<any> | void;
    private handleHttp;
    private handleRpc;
    private mapHttpToGrpc;
}
