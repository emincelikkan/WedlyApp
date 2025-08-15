import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Product, Priority } from '@/types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onEdit?: () => void;
  isGuestMode?: boolean;
}

export function ProductCard({ product, onPress, onEdit, isGuestMode = false }: ProductCardProps) {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return '#ff4757';
      case Priority.MEDIUM:
        return '#ffa502';
      case Priority.LOW:
        return '#2ed573';
      default:
        return '#747d8c';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'flame';
      case Priority.MEDIUM:
        return 'star';
      case Priority.LOW:
        return 'leaf';
      default:
        return 'help-circle';
    }
  };

  const completionPercentage = product.quantity > 0 ? (product.quantityReceived / product.quantity) * 100 : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {product.imageUri ? (
            <Image source={{ uri: product.imageUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="gift" size={32} color="#a4b0be" />
            </View>
          )}
          
          {/* Priority Badge */}
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(product.priority) }]}>
            <Ionicons 
              name={getPriorityIcon(product.priority) as any} 
              size={12} 
              color="white" 
            />
          </View>

          {/* Status Badge */}
          {product.isPurchased && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          
          <Text style={styles.category}>{product.category}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {!isGuestMode && onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                <Ionicons name="pencil" size={16} color="#5352ed" />
              </TouchableOpacity>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <LinearGradient
                colors={['#5352ed', '#3742fa']}
                style={[styles.progressFill, { width: `${completionPercentage}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.progressText}>
              {product.quantityReceived}/{product.quantity}
            </Text>
          </View>

          {product.purchasedBy && (
            <Text style={styles.purchasedBy} numberOfLines={1}>
              Gift from {product.purchasedBy}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 4,
    lineHeight: 20,
  },
  category: {
    fontSize: 12,
    color: '#747d8c',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5352ed',
  },
  editButton: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#ddd6fe',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#747d8c',
    fontWeight: '500',
    minWidth: 30,
  },
  purchasedBy: {
    fontSize: 11,
    color: '#2ed573',
    fontStyle: 'italic',
    marginTop: 4,
  },
});