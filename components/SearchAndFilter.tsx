import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, Priority, FilterOptions } from '@/types';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export function SearchAndFilter({ onSearch, onFilter, currentFilters }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState(currentFilters.searchQuery || '');
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(currentFilters);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const applyFilters = () => {
    onFilter(tempFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {};
    setTempFilters(clearedFilters);
    onFilter(clearedFilters);
    setShowFilters(false);
  };

  const hasActiveFilters = () => {
    return !!(
      currentFilters.category ||
      currentFilters.priority ||
      currentFilters.priceRange ||
      currentFilters.purchaseStatus !== 'all'
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#747d8c" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search registry items..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#a4b0be"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#747d8c" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.filterButton, hasActiveFilters() && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons 
            name="options" 
            size={20} 
            color={hasActiveFilters() ? 'white' : '#5352ed'} 
          />
          {hasActiveFilters() && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={applyFilters}>
              <Text style={styles.applyButton}>Apply</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Category</Text>
              <View style={styles.optionsGrid}>
                {Object.values(Category).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.optionChip,
                      tempFilters.category === category && styles.optionChipSelected
                    ]}
                    onPress={() => setTempFilters({
                      ...tempFilters,
                      category: tempFilters.category === category ? undefined : category
                    })}
                  >
                    <Text style={[
                      styles.optionChipText,
                      tempFilters.category === category && styles.optionChipTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Priority</Text>
              <View style={styles.optionsGrid}>
                {Object.values(Priority).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.optionChip,
                      tempFilters.priority === priority && styles.optionChipSelected
                    ]}
                    onPress={() => setTempFilters({
                      ...tempFilters,
                      priority: tempFilters.priority === priority ? undefined : priority
                    })}
                  >
                    <Text style={[
                      styles.optionChipText,
                      tempFilters.priority === priority && styles.optionChipTextSelected
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Purchase Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Purchase Status</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Show purchased items</Text>
                <Switch
                  value={tempFilters.purchaseStatus !== 'unpurchased'}
                  onValueChange={(value) => setTempFilters({
                    ...tempFilters,
                    purchaseStatus: value ? 'all' : 'unpurchased'
                  })}
                  trackColor={{ false: '#e1e5e9', true: '#5352ed' }}
                  thumbColor="white"
                />
              </View>
            </View>

            {/* Clear Filters Button */}
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f2f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2f3542',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#5352ed',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4757',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  cancelButton: {
    fontSize: 16,
    color: '#747d8c',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f3542',
  },
  applyButton: {
    fontSize: 16,
    color: '#5352ed',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  optionChipSelected: {
    backgroundColor: '#5352ed',
    borderColor: '#5352ed',
  },
  optionChipText: {
    fontSize: 14,
    color: '#747d8c',
    fontWeight: '500',
  },
  optionChipTextSelected: {
    color: 'white',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2f3542',
  },
  clearFiltersButton: {
    backgroundColor: '#ff4757',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});