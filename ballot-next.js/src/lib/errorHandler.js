export const ERROR_CODES = {
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  WALLET_ERROR: 'WALLET_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.CONTRACT_ERROR]: '智能合约调用失败',
  [ERROR_CODES.NETWORK_ERROR]: '网络连接异常，请检查网络',
  [ERROR_CODES.WALLET_ERROR]: '钱包连接失败，请检查钱包',
  [ERROR_CODES.VALIDATION_ERROR]: '输入验证失败，请检查输入',
  [ERROR_CODES.UNKNOWN_ERROR]: '未知错误，请稍后重试',
};

export function createError(message, code = ERROR_CODES.UNKNOWN_ERROR) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function getErrorMessage(error) {
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  if (error.message) {
    return error.message;
  }
  return ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
}

export function handleError(error, customHandler, logToConsole = false) {
  // 只在开发环境或明确要求时输出到控制台
  if (logToConsole || process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }
  
  if (customHandler && typeof customHandler === 'function') {
    customHandler(error);
  }
  
  return getErrorMessage(error);
}