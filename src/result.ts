/**
 * Success result type
 * 
 * @public
*/
export type Success<U> = {
  success: true;
  index: number;
  value: U;
};

/**
 * Make a success result.
 * 
 * @public
*/
export function success<U>(index: number, value: U): Success<U> {
  return {
    success: true,
    value: value,
    index: index,
  };
}

/**
 * Failure result type
 * 
 * @public
*/
export type Failure = {
  success: false;
  index: number;
};

/**
 * Make a failure result.
 * 
 * @public
*/
export function failure(index: number): Failure {
  return {
    success: false,
    index: index,
  };
}

/**
 * Parser result
 * 
 * @public
 */
export type Result<U> = Success<U> | Failure;
