import { Product, BudgetStats } from '@/types';

export class BudgetCalculator {
  static calculateStats(products: Product[]): BudgetStats {
    const totalItems = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const receivedValue = products.reduce((sum, product) => {
      if (product.isPurchased) {
        return sum + (product.price * product.quantityReceived);
      }
      return sum;
    }, 0);
    
    const remainingValue = totalValue - receivedValue;
    const completionPercentage = totalValue > 0 ? (receivedValue / totalValue) * 100 : 0;

    return {
      totalItems,
      totalValue,
      receivedValue,
      remainingValue,
      completionPercentage
    };
  }

  static getItemsByCategory(products: Product[]) {
    const categoryStats = products.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          received: 0,
          value: 0,
          receivedValue: 0
        };
      }
      
      acc[category].total += product.quantity;
      acc[category].received += product.quantityReceived;
      acc[category].value += product.price * product.quantity;
      acc[category].receivedValue += product.price * product.quantityReceived;
      
      return acc;
    }, {} as Record<string, any>);

    return categoryStats;
  }

  static getPriorityBreakdown(products: Product[]) {
    return products.reduce((acc, product) => {
      const priority = product.priority;
      if (!acc[priority]) {
        acc[priority] = {
          count: 0,
          value: 0,
          received: 0
        };
      }
      
      acc[priority].count += 1;
      acc[priority].value += product.price * product.quantity;
      if (product.isPurchased) {
        acc[priority].received += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);
  }
}