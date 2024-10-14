import { join } from "path";
import { verifyAamarPayment } from "./payment.utils";
import { readFileSync } from "fs";

const confirmationService = async (transactionId: string, status: string) => {

    const verifyResponse = await verifyAamarPayment(transactionId);

    let message = "";

    if (verifyResponse && verifyResponse.pay_status === 'Successful') {
        message = "Successfully Paid!"
    } else {
        message = "Payment Failed!"
    }

    const filePath = join(__dirname, '../../../../views/confirmation.html');

    let template = readFileSync(filePath, 'utf-8');

    template = template.replace('{{message}}', message)
    console.log(status);

    return template;
}

export const paymentServices = {
    confirmationService,
}