import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body;

        // If response is plain true/false, return as-is
        if (typeof body === 'boolean') {
          return event.clone({ body });
        }

        // If response has success + receipt_number, return full object
        if (body && typeof body === 'object') {
          return event.clone({ body });
        }

        return event;
      }
      return event;
    })
  );
};