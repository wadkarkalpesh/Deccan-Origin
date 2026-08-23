"""
Deccan Origin — Request Tracing & Structured Logging Middleware
"""
import uuid
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class LoggingAndTracingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Retrieve or generate Request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        
        # Attach request ID to request state so routes can log/access it
        request.state.request_id = request_id
        
        start_time = time.time()
        
        try:
            response = await call_next(request)
        except Exception as e:
            # In case request processing crashed and was not caught
            process_time_ms = (time.time() - start_time) * 1000
            print(f"[Deccan-Origin] ERROR | RequestID: {request_id} | {request.method} {request.url.path} | Crash: {e} | ProcessTime: {process_time_ms:.2f}ms")
            raise e
            
        process_time_ms = (time.time() - start_time) * 1000
        
        # Expose headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time-Ms"] = f"{process_time_ms:.2f}"
        
        # Structured log print
        print(
            f"[Deccan-Origin] INFO | RequestID: {request_id} | "
            f"{request.method} {request.url.path} | "
            f"Status: {response.status_code} | "
            f"Time: {process_time_ms:.2f}ms"
        )
        
        return response
