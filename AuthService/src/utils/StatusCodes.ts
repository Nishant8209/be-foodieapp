export enum StatusCode {
    OK = 200,
    Created = 201,
    No_Content = 204,
    Found = 302,
    Moved_Permanently = 301,
    Not_Modified = 304,
    Bad_Request = 400,
    Unauthorized = 401,
    Forbidden = 403,
    Not_Found = 404,
    Conflict = 409,
    Unprocessable_Entity = 422,
    Internal_Server_Error = 500,
    Not_Implemented = 501,
    Bad_Gateway = 502,
    Service_Unavailable = 503
}

// 200 OK: The request has succeeded (commonly used for successful GET, POST, PUT, PATCH requests).
// 201 Created: The request has succeeded, and a new resource has been created (used with POST requests).
// 204 No Content: The server successfully processed the request but is not returning any content (often used for DELETE requests).
// 301 Moved Permanently: The requested resource has been permanently moved to a new URL.
// 302 Found: The requested resource resides temporarily at a different URL (commonly used for redirects).
// 304 Not Modified: Indicates that the resource has not been modified since the last request (used with caching).
// 400 Bad Request: The server cannot process the request due to client error (e.g., malformed request syntax).
// 401 Unauthorized: Authentication is required and has failed or has not been provided.
// 403 Forbidden: The server understands the request, but it refuses to authorize it (access is denied).
// 404 Not Found: The requested resource could not be found on the server.
// 409 Conflict: Indicates a request conflict with the current state of the resource (e.g., attempting to create a duplicate resource).
// 422 Unprocessable Entity: The request was well-formed but was unable to be followed due to semantic errors (often used for validation errors).
// 500 Internal Server Error: A generic error message indicating that the server encountered an unexpected condition.
// 501 Not Implemented: The server does not support the functionality required to fulfill the request.
// 502 Bad Gateway: The server, while acting as a gateway or proxy, received an invalid response from the upstream server.
// 503 Service Unavailable: The server is currently unable to handle the request due to temporary overload or maintenance.
