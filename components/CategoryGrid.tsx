import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '@/types';

interface CategoryItem {
  category: Category;
  count: number;
  completedCount: number;
  totalValue: number;
}

interface CategoryGridProps {
  categories: CategoryItem[];
  onCategoryPress: (category: Category) => void;
}

const categoryIcons: Record<Category, string> = {
  [Category.KITCHEN]: 'restaurant',
  [Category.BATHROOM]: 'water',
  [Category.BEDROOM]: 'bed',
  [Category.LIVING_ROOM]: 'tv',
  [Category.DINING_ROOM]: 'wine',
  [Category.LAUNDRY]: 'shirt',
  [Category.OUTDOOR]: 'leaf',
};

const categoryColors: Record<Category, string[]> = {
  [Category.KITCHEN]: ['#ff6b6b', '#ee5a52'],
  [Category.BATHROOM]: ['#4ecdc4', '#44a08d'],
  [Category.BEDROOM]: ['#a55eea', '#8b5cf6'],
  [Category.LIVING_ROOM]: ['#26de81', '#20bf6b'],
  [Category.DINING_ROOM]: ['#fd79a8', '#e84393'],
  [Category.LAUNDRY]: ['#74b9ff', '#0984e3'],
  [Category.OUTDOOR]: ['#00b894', '#00a085'],
};

export function CategoryGrid({ categories, onCategoryPress }: CategoryGridProps) {
  const renderCategoryItem = ({ item }: { item: CategoryItem }) => {
    const completionPercentage = item.count > 0 ? (item.completedCount / item.count) * 100 : 0;
    const colors = categoryColors[item.category];
    const iconName = categoryIcons[item.category];

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => onCategoryPress(item.category)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors}
          style={styles.categoryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.categoryContent}>
            <View style={styles.categoryHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name={iconName as any} size={24} color="white" />
              </View>
              <Text style={styles.categoryName}>{item.category}</Text>
            </View>

            <View style={styles.categoryStats}>
              <Text style={styles.itemCount}>
                {item.count} item{item.count !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.totalValue}>
                ${item.totalValue.toFixed(0)}
              </Text>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${completionPercentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {completionPercentage.toFixed(0)}% complete
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={categories}
      renderItem={renderCategoryItem}
      keyExtractor={(item) => item.category}
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    flex: 1,
    margin: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryGradient: {
    padding: 20,
    minHeight: 140,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  categoryStats: {
    alignItems: 'center',
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  progressSection: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
});