import { Router } from 'express';
import { paymentController } from './payment.controller';
import { initiatePayment } from '../User/user.service';
// import  { initiatePaymentSchema, validateRequestParams } from '../../middlewares/validateRequest';



const paymentRouter = Router();

paymentRouter.post('/confirmation', paymentController.confirmationController)

// Route to initiate payment for premium membership 
paymentRouter.post(
  '/initiate-payment/:userId',
  // validateRequestParams(initiatePaymentSchema), // Validate params and body
  initiatePayment // Proceed with payment initiation
);

export default paymentRouter;
