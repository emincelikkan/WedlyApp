import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { Product, RegistryInfo } from '@/types';
import { BudgetCalculator } from './budget';

export class SharingService {
  static async shareRegistry(products: Product[], registryInfo: RegistryInfo): Promise<void> {
    try {
      const shareText = this.generateShareText(products, registryInfo);
      
      if (await Sharing.isAvailableAsync()) {
        // Create a temporary text file
        const fileUri = FileSystem.documentDirectory + 'wedding-registry.txt';
        await FileSystem.writeAsStringAsync(fileUri, shareText);
        
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Wedding Registry'
        });
      }
    } catch (error) {
      console.error('Error sharing registry:', error);
      throw new Error('Failed to share registry');
    }
  }

  static async exportToPDF(products: Product[], registryInfo: RegistryInfo): Promise<void> {
    try {
      const html = this.generatePDFHTML(products, registryInfo);
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export Wedding Registry PDF'
        });
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error('Failed to export PDF');
    }
  }

  static async exportToCSV(products: Product[]): Promise<void> {
    try {
      const csv = this.generateCSV(products);
      const fileUri = FileSystem.documentDirectory + 'wedding-registry.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Wedding Registry CSV'
        });
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Failed to export CSV');
    }
  }

  private static generateShareText(products: Product[], registryInfo: RegistryInfo): string {
    const stats = BudgetCalculator.calculateStats(products);
    
    let text = `🎉 ${registryInfo.coupleName}'s Wedding Registry\n\n`;
    
    if (registryInfo.weddingDate) {
      text += `Wedding Date: ${registryInfo.weddingDate.toLocaleDateString()}\n`;
    }
    
    text += `Registry ID: ${registryInfo.shareCode}\n\n`;
    text += `📊 Registry Summary:\n`;
    text += `• Total Items: ${stats.totalItems}\n`;
    text += `• Total Value: $${stats.totalValue.toFixed(2)}\n`;
    text += `• Completion: ${stats.completionPercentage.toFixed(1)}%\n\n`;
    
    text += `🎁 Items by Category:\n`;
    const categoryStats = BudgetCalculator.getItemsByCategory(products);
    Object.entries(categoryStats).forEach(([category, stats]: [string, any]) => {
      text += `• ${category}: ${stats.received}/${stats.total} items\n`;
    });
    
    return text;
  }

  private static generatePDFHTML(products: Product[], registryInfo: RegistryInfo): string {
    const stats = BudgetCalculator.calculateStats(products);
    
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .product { border-bottom: 1px solid #eee; padding: 10px 0; }
            .product-name { font-weight: bold; font-size: 16px; }
            .product-details { color: #666; margin-top: 5px; }
            .category-header { background: #e3f2fd; padding: 10px; margin: 20px 0 10px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${registryInfo.coupleName}'s Wedding Registry</h1>
            ${registryInfo.weddingDate ? `<p>Wedding Date: ${registryInfo.weddingDate.toLocaleDateString()}</p>` : ''}
          </div>
          
          <div class="stats">
            <h3>Registry Summary</h3>
            <p>Total Items: ${stats.totalItems}</p>
            <p>Total Value: $${stats.totalValue.toFixed(2)}</p>
            <p>Received Value: $${stats.receivedValue.toFixed(2)}</p>
            <p>Completion: ${stats.completionPercentage.toFixed(1)}%</p>
          </div>
          
          ${this.generateProductListHTML(products)}
        </body>
      </html>
    `;
  }

  private static generateProductListHTML(products: Product[]): string {
    const productsByCategory = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    let html = '';
    Object.entries(productsByCategory).forEach(([category, categoryProducts]) => {
      html += `<div class="category-header">${category}</div>`;
      categoryProducts.forEach(product => {
        html += `
          <div class="product">
            <div class="product-name">${product.name}</div>
            <div class="product-details">
              Price: $${product.price.toFixed(2)} | 
              Quantity: ${product.quantityReceived}/${product.quantity} | 
              Priority: ${product.priority} |
              ${product.isPurchased ? '✅ Purchased' : '⏳ Needed'}
            </div>
            ${product.description ? `<div class="product-details">${product.description}</div>` : ''}
          </div>
        `;
      });
    });

    return html;
  }

  private static generateCSV(products: Product[]): string {
    const headers = [
      'Name', 'Description', 'Price', 'Category', 'Priority', 
      'Quantity', 'Quantity Received', 'Status', 'Purchased By', 
      'Date Added', 'Notes', 'Product URL'
    ];
    
    let csv = headers.join(',') + '\n';
    
    products.forEach(product => {
      const row = [
        `"${product.name}"`,
        `"${product.description}"`,
        product.price.toString(),
        product.category,
        product.priority,
        product.quantity.toString(),
        product.quantityReceived.toString(),
        product.isPurchased ? 'Purchased' : 'Needed',
        `"${product.purchasedBy || ''}"`,
        product.dateAdded.toLocaleDateString(),
        `"${product.notes}"`,
        `"${product.productURL || ''}"`
      ];
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }
}