declare module "midtrans-client" {
  type MidtransConfig = {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  };

  export class Snap {
    constructor(config: MidtransConfig);
    createTransaction(payload: Record<string, unknown>): Promise<{ token: string; redirect_url: string }>;
  }

  export class CoreApi {
    constructor(config: MidtransConfig);
    transaction: {
      notification(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
      status(orderId: string): Promise<Record<string, unknown>>;
    };
  }

  const _default: { Snap: typeof Snap; CoreApi: typeof CoreApi };
  export default _default;
}
