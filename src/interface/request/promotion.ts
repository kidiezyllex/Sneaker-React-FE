export interface IPromotionFilter {
  status?: 'ACTIVE' | 'UNACTIVE';
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface IPromotionCreate {
  name: string;
  description?: string;
  discountPercent: number;
  products?: string[];
  startDate: string | Date;
  endDate: string | Date;
}

export interface IPromotionUpdate {
  name?: string;
  description?: string;
  discountPercent?: number;
  productIds?: string[];
  startDate?: string | Date;
  endDate?: string | Date;
  status?: 'ACTIVE' | 'UNACTIVE';
} 