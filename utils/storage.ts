import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/types';

const PRODUCTS_KEY = 'wishlist_products';
const REGISTRY_INFO_KEY = 'registry_info';

export interface RegistryInfo {
  coupleName: string;
  weddingDate?: Date;
  registryId: string;
  shareCode: string;
}

export class StorageService {
  static async saveProducts(products: Product[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(products);
      await AsyncStorage.setItem(PRODUCTS_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving products:', error);
      throw new Error('Failed to save products');
    }
  }

  static async loadProducts(): Promise<Product[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(PRODUCTS_KEY);
      if (jsonValue != null) {
        const products = JSON.parse(jsonValue);
        // Convert date strings back to Date objects
        return products.map((product: any) => ({
          ...product,
          dateAdded: new Date(product.dateAdded)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  static async saveRegistryInfo(info: RegistryInfo): Promise<void> {
    try {
      const jsonValue = JSON.stringify(info);
      await AsyncStorage.setItem(REGISTRY_INFO_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving registry info:', error);
      throw new Error('Failed to save registry info');
    }
  }

  static async loadRegistryInfo(): Promise<RegistryInfo | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(REGISTRY_INFO_KEY);
      if (jsonValue != null) {
        const info = JSON.parse(jsonValue);
        return {
          ...info,
          weddingDate: info.weddingDate ? new Date(info.weddingDate) : undefined
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading registry info:', error);
      return null;
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([PRODUCTS_KEY, REGISTRY_INFO_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }
}