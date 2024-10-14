/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios"
import config from "../../config"

export const initiateAamarPayment = async (paymentData: any) => {
    try {
        const response = await axios.post(config.baseURL, {
            store_id: config.storeID,
            signature_key: config.signatureKey,
            tran_id: paymentData.transactionId,
            success_url: `https://cheffy-server.vercel.app/api/payment/confirmation?transactionId=${paymentData.transactionId}&status=success`,
            fail_url: `https://cheffy-server.vercel.app/api/payment/confirmation?status=failed`,
            cancel_url: "https://cheffy-client.vercel.app/",
            amount: paymentData.amount,
            currency: "BDT",
            desc: "Merchant Registration Payment",
            cus_name: paymentData.customerName,
            cus_email: paymentData.customerEmail,
            cus_add1: paymentData.customerAddress,
            cus_add2: "N/A",
            cus_city: "N/A",
            cus_state: "N/A",
            cus_postcode: "N/A",
            cus_country: "N/A",
            cus_phone: paymentData.customerPhone,
            type: "json"
        });

        return response.data;
    } catch (err) {
        console.log("err from paymentUtils: => ", err);
        throw new Error("Payment initiation failed!");
    }
}


export const verifyAamarPayment = async (tnxId: string) => {
    try {
        const response = await axios.get(config.paymentVerifyURL!, {
            params: {
                store_id: config.storeID,
                signature_key: config.signatureKey,
                type: "json",
                request_id: tnxId,
            }
        });

        return response.data;
    } catch (err) {
        console.log(err);
        throw new Error("Payment validation failed!");
    }
}