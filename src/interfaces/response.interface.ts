export type ResponseMessage = string;
export enum ResponseStatus {
  Error = 'error',
  Success = 'success',
}

export interface HttpResponseBase {
  status: ResponseStatus;
  message: ExceptionInfo;
}

export type ResponseInfo = {
  message: ResponseMessage;
  error?: any;
};

export type ExceptionInfo = ResponseMessage | ResponseInfo;

// paginate data
export interface HttpPaginateResult<T> {
  data: T;
  pagination: {
    total: number;
    current_page: number;
    total_page: number;
    per_page: number;
  };
}

// HTTP error
export type HttpResponseError = HttpResponseBase & {
  error: any;
  debug?: string;
};

// HTTP success
export type HttpResponseSuccess<T> = HttpResponseBase & {
  params?: any;
  result: T | HttpPaginateResult<T>;
};

// HTTP response
export type HttpResponse<T> = HttpResponseError | HttpResponseSuccess<T>;
