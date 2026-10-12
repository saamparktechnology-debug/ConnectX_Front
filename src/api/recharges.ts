// src/api/recharges.ts
import { post } from "./client";

export type RechargeInitiateResponse = {
  rechargeUuid: string;
  payuCheckoutUrl: string;
  params: {
    key: string;
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    phone: string;
    surl: string;
    furl: string;
    hash: string;
  };
};

export const rechargesApi = {
  initiate(amount: number, idempotencyKey: string) {
    return post<RechargeInitiateResponse>(
      "/recharges/initiate",
      { amount, idempotencyKey },
      { headers: { "x-idempotency-key": idempotencyKey } },
    );
  },
};
