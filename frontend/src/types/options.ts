export interface PutOption {
    id: number;
    strike_price: number;
    premium_price: number;
    expiry: Date;
    asset: string;
    seller_address: string;
    buyer_address?: string;
    asset_transfered: boolean;
    created_at: Date;
  }
  
export interface CreatePutOptionDTO {
    strike_price: number;
    premium_price: number;
    expiry: Date;
    asset: string;
    seller_address: string;
}