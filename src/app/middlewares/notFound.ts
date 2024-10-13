import { Request, Response, RequestHandler } from 'express';
import httpStatus from 'http-status';

const notFound: RequestHandler = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API Not Found !!',
    error: '',
  });
};

export default notFound;
