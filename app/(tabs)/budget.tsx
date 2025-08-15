import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Product, Category, Priority } from '@/types';
import { StorageService } from '@/utils/storage';
import { BudgetCalculator } from '@/utils/budget';
import { BudgetProgressView } from '@/components/BudgetProgressView';
import { SharingService } from '@/utils/sharing';

export default function BudgetScreen() {
  const [products, setProducts] = useState<Product[]>([]);
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

  const handleExportPDF = async () => {
    try {
      const registryInfo = await StorageService.loadRegistryInfo();
      if (!registryInfo) {
        Alert.alert('Error', 'Registry information not found');
        return;
      }
      await SharingService.exportToPDF(products, registryInfo);
    } catch (error) {
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const handleExportCSV = async () => {
    try {
      await SharingService.exportToCSV(products);
    } catch (error) {
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const budgetStats = BudgetCalculator.calculateStats(products);
  const categoryStats = BudgetCalculator.getItemsByCategory(products);
  const priorityStats = BudgetCalculator.getPriorityBreakdown(products);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderCategoryStats = () => {
    return Object.entries(categoryStats).map(([category, stats]: [string, any]) => {
      const completionPercentage = stats.total > 0 ? (stats.received / stats.total) * 100 : 0;
      
      return (
        <View key={category} style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statTitle}>{category}</Text>
            <Text style={styles.statValue}>{formatCurrency(stats.value)}</Text>
          </View>
          
          <View style={styles.statDetails}>
            <Text style={styles.statDetail}>
              {stats.received}/{stats.total} items received
            </Text>
            <Text style={styles.statDetail}>
              {formatCurrency(stats.receivedValue)} received
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${completionPercentage}%` }
              ]} 
            />
          </View>
        </View>
      );
    });
  };

  const renderPriorityStats = () => {
    const priorityColors = {
      [Priority.HIGH]: '#ff4757',
      [Priority.MEDIUM]: '#ffa502',
      [Priority.LOW]: '#2ed573',
    };

    return Object.entries(priorityStats).map(([priority, stats]: [string, any]) => {
      const completionPercentage = stats.count > 0 ? (stats.received / stats.count) * 100 : 0;
      const color = priorityColors[priority as Priority];
      
      return (
        <View key={priority} style={styles.priorityCard}>
          <LinearGradient
            colors={[color, color + '80']}
            style={styles.priorityGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.priorityTitle}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </Text>
            <Text style={styles.priorityValue}>
              {formatCurrency(stats.value)}
            </Text>
            <Text style={styles.priorityDetail}>
              {stats.received}/{stats.count} items ({completionPercentage.toFixed(0)}%)
            </Text>
          </LinearGradient>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget & Analytics</Text>
        <View style={styles.exportButtons}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
            <Ionicons name="document-text" size={16} color="#5352ed" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportCSV}>
            <Ionicons name="download" size={16} color="#5352ed" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <BudgetProgressView stats={budgetStats} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories Breakdown</Text>
          {Object.keys(categoryStats).length > 0 ? (
            renderCategoryStats()
          ) : (
            <Text style={styles.emptyText}>No categories yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Breakdown</Text>
          <View style={styles.priorityGrid}>
            {Object.keys(priorityStats).length > 0 ? (
              renderPriorityStats()
            ) : (
              <Text style={styles.emptyText}>No priority data yet</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStat}>
              <Ionicons name="gift" size={24} color="#5352ed" />
              <Text style={styles.quickStatValue}>{budgetStats.totalItems}</Text>
              <Text style={styles.quickStatLabel}>Total Items</Text>
            </View>
            
            <View style={styles.quickStat}>
              <Ionicons name="checkmark-circle" size={24} color="#2ed573" />
              <Text style={styles.quickStatValue}>
                {products.filter(p => p.isPurchased).length}
              </Text>
              <Text style={styles.quickStatLabel}>Received</Text>
            </View>
            
            <View style={styles.quickStat}>
              <Ionicons name="time" size={24} color="#ffa502" />
              <Text style={styles.quickStatValue}>
                {products.filter(p => !p.isPurchased).length}
              </Text>
              <Text style={styles.quickStatLabel}>Pending</Text>
            </View>
            
            <View style={styles.quickStat}>
              <Ionicons name="trending-up" size={24} color="#ff4757" />
              <Text style={styles.quickStatValue}>
                {budgetStats.completionPercentage.toFixed(0)}%
              </Text>
              <Text style={styles.quickStatLabel}>Complete</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  exportButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2f3542',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5352ed',
  },
  statDetails: {
    marginBottom: 12,
  },
  statDetail: {
    fontSize: 14,
    color: '#747d8c',
    marginBottom: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e1e5e9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5352ed',
    borderRadius: 2,
  },
  priorityGrid: {
    gap: 12,
  },
  priorityCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priorityGradient: {
    padding: 16,
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  priorityValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  priorityDetail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickStat: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2f3542',
    marginTop: 8,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#747d8c',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#747d8c',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 32,
  },
});