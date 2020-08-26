// 에러가 발생하면, 얘가 전담처리.
// 이 에러 헨들러가 직접, 클라이언트에게 에러를 리스펀스.

const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Server Error",
  });
};

module.exports = errorHandler;
