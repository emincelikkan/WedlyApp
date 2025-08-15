import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Product, Category } from '@/types';
import { StorageService } from '@/utils/storage';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ProductCard } from '@/components/ProductCard';

interface CategoryItem {
  category: Category;
  count: number;
  completedCount: number;
  totalValue: number;
}

export default function CategoriesScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      const loadedProducts = await StorageService.loadProducts();
      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const getCategoryData = (): CategoryItem[] => {
    const categoryMap = new Map<Category, CategoryItem>();

    // Initialize all categories
    Object.values(Category).forEach(category => {
      categoryMap.set(category, {
        category,
        count: 0,
        completedCount: 0,
        totalValue: 0,
      });
    });

    // Populate with product data
    products.forEach(product => {
      const categoryData = categoryMap.get(product.category)!;
      categoryData.count += 1;
      categoryData.totalValue += product.price * product.quantity;
      if (product.isPurchased) {
        categoryData.completedCount += 1;
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  };

  const getProductsForCategory = (category: Category): Product[] => {
    return products
      .filter(product => product.category === category)
      .sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product-detail',
      params: { productId: product.id }
    });
  };

  const handleEditProduct = (product: Product) => {
    router.push({
      pathname: '/add-product',
      params: { productId: product.id }
    });
  };

  const handleAddProduct = () => {
    router.push({
      pathname: '/add-product',
      params: { category: selectedCategory }
    });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onEdit={() => handleEditProduct(item)}
    />
  );

  if (selectedCategory) {
    const categoryProducts = getProductsForCategory(selectedCategory);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackToCategories}
          >
            <Text style={styles.backButtonText}>← Categories</Text>
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>{selectedCategory}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categoryProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>
          {products.length} items across {getCategoryData().filter(c => c.count > 0).length} categories
        </Text>
      </View>

      <CategoryGrid
        categories={getCategoryData()}
        onCategoryPress={handleCategoryPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2f3542',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#747d8c',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2f3542',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#5352ed',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#5352ed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  listContainer: {
    flexGrow: 1,
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
});