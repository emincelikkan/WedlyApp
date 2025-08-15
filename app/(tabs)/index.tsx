import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Product, FilterOptions } from '@/types';
import { StorageService } from '@/utils/storage';
import { ProductCard } from '@/components/ProductCard';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { BudgetProgressView } from '@/components/BudgetProgressView';
import { BudgetCalculator } from '@/utils/budget';

export default function RegistryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  const loadProducts = useCallback(async () => {
    try {
      const loadedProducts = await StorageService.loadProducts();
      setProducts(loadedProducts);
      applyFilters(loadedProducts, filters);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  const applyFilters = (productList: Product[], currentFilters: FilterOptions) => {
    let filtered = [...productList];

    // Search filter
    if (currentFilters.searchQuery) {
      const query = currentFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (currentFilters.category) {
      filtered = filtered.filter(product => product.category === currentFilters.category);
    }

    // Priority filter
    if (currentFilters.priority) {
      filtered = filtered.filter(product => product.priority === currentFilters.priority);
    }

    // Purchase status filter
    if (currentFilters.purchaseStatus === 'purchased') {
      filtered = filtered.filter(product => product.isPurchased);
    } else if (currentFilters.purchaseStatus === 'unpurchased') {
      filtered = filtered.filter(product => !product.isPurchased);
    }

    // Price range filter
    if (currentFilters.priceRange) {
      filtered = filtered.filter(product =>
        product.price >= currentFilters.priceRange!.min &&
        product.price <= currentFilters.priceRange!.max
      );
    }

    // Sort by date added (newest first)
    filtered.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());

    setFilteredProducts(filtered);
  };

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    applyFilters(products, newFilters);
  };

  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    applyFilters(products, newFilters);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
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
    router.push('/add-product');
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const budgetStats = BudgetCalculator.calculateStats(products);

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onEdit={() => handleEditProduct(item)}
    />
  );

  const renderHeader = () => (
    <View>
      <BudgetProgressView stats={budgetStats} />
      <SearchAndFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        currentFilters={filters}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="gift-outline" size={64} color="#a4b0be" />
      <Text style={styles.emptyTitle}>No Items Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start building your wedding registry by adding your first item
      </Text>
      <TouchableOpacity style={styles.addFirstButton} onPress={handleAddProduct}>
        <Text style={styles.addFirstButtonText}>Add Your First Item</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wedding Registry</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5352ed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5352ed',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  listContainer: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2f3542',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#747d8c',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstButton: {
    backgroundColor: '#5352ed',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});