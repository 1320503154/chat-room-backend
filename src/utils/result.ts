export class Result<T> {
    private constructor(
      public readonly code: number,
      public readonly message: string,
      public readonly data?: T
    ) {}
  
    static success<T>(data?: T, message: string = 'success'): Result<T> {
      return new Result<T>(200, message, data);
    }
  
    static error<T>(message: string = 'error', code: number = 400): Result<T> {
      return new Result<T>(code, message);
    }
  
    static notFound<T>(message: string = 'not_found'): Result<T> {
      return new Result<T>(404, message);
    }
  
    static forbidden<T>(message: string = 'forbidden'): Result<T> {
      return new Result<T>(403, message);
    }
  
    static unauthorized<T>(message: string = 'unauthorized'): Result<T> {
      return new Result<T>(401, message);
    }
  }