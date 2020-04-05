import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { HttpCache  } from './app-http-cache';
import { of, concat, empty } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable()
export class CachingInterceptor implements HttpInterceptor {
    constructor(private cache: HttpCache) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Still skip non-GET requests.
        if (req.method !== 'GET') {
            return next.handle(req);
        }

        // This will be an Observable of the cached value if there is one,
        // or an empty Observable otherwise. It starts out empty.
        let maybeCachedResponse: Observable<HttpEvent<any>> = empty();

        // Check the cache.
        const cachedResponse = this.cache.get(req);
        if (cachedResponse) {
            maybeCachedResponse = of(cachedResponse);
        }

        // Create an Observable (but don't subscribe) that represents making
        // the network request and caching the value.
        const networkResponse = next.handle(req).pipe(tap(event => {
            // Just like before, check for the HttpResponse event and cache it.
            if (event instanceof HttpResponse) {
                this.cache.put(req, event);
            }
        }));

        // Now, combine the two and send the cached response first (if there is
        // one), and the network response second.
        return concat(maybeCachedResponse, networkResponse);
    }
}
