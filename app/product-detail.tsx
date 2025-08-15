import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Product, Priority } from '@/types';
import { StorageService } from '@/utils/storage';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const products = await StorageService.loadProducts();
      const foundProduct = products.find(p => p.id === params.productId);
      setProduct(foundProduct || null);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (product) {
      router.push({
        pathname: '/add-product',
        params: { productId: product.id }
      });
    }
  };

  const handleMarkAsPurchased = async () => {
    if (!product) return;

    Alert.prompt(
      'Mark as Purchased',
      'Who purchased this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Purchased',
          onPress: async (purchasedBy) => {
            try {
              const products = await StorageService.loadProducts();
              const updatedProducts = products.map(p => 
                p.id === product.id 
                  ? { 
                      ...p, 
                      isPurchased: true, 
                      quantityReceived: p.quantity,
                      purchasedBy: purchasedBy || 'Anonymous'
                    }
                  : p
              );
              
              await StorageService.saveProducts(updatedProducts);
              setProduct({
                ...product,
                isPurchased: true,
                quantityReceived: product.quantity,
                purchasedBy: purchasedBy || 'Anonymous'
              });
              
              Alert.alert('Success', 'Item marked as purchased!');
            } catch (error) {
              Alert.alert('Error', 'Failed to update item');
            }
          }
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const handleMarkAsNeeded = async () => {
    if (!product) return;

    try {
      const products = await StorageService.loadProducts();
      const updatedProducts = products.map(p => 
        p.id === product.id 
          ? { 
              ...p, 
              isPurchased: false, 
              quantityReceived: 0,
              purchasedBy: undefined
            }
          : p
      );
      
      await StorageService.saveProducts(updatedProducts);
      setProduct({
        ...product,
        isPurchased: false,
        quantityReceived: 0,
        purchasedBy: undefined
      });
      
      Alert.alert('Success', 'Item marked as needed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleOpenURL = async () => {
    if (product?.productURL) {
      try {
        const supported = await Linking.canOpenURL(product.productURL);
        if (supported) {
          await Linking.openURL(product.productURL);
        } else {
          Alert.alert('Error', 'Cannot open this URL');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open URL');
      }
    }
  };

  const handleShare = async () => {
    if (!product) return;

    try {
      const message = `Check out this item from our wedding registry:\n\n${product.name}\n$${product.price.toFixed(2)}\n\n${product.description}`;
      
      await Share.share({
        message,
        title: product.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return ['#ff4757', '#ff3838'];
      case Priority.MEDIUM:
        return ['#ffa502', '#ff9500'];
      case Priority.LOW:
        return ['#2ed573', '#20bf6b'];
      default:
        return ['#747d8c', '#57606f'];
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ff4757" />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The product you're looking for doesn't exist.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completionPercentage = product.quantity > 0 ? (product.quantityReceived / product.quantity) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2f3542" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share" size={20} color="#5352ed" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="pencil" size={20} color="#5352ed" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          {product.imageUri ? (
            <Image source={{ uri: product.imageUri }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="gift" size={64} color="#a4b0be" />
            </View>
          )}
          
          {/* Status Badge */}
          {product.isPurchased && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.statusBadgeText}>Purchased</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
            
            <LinearGradient
              colors={getPriorityColor(product.priority)}
              style={styles.priorityBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons 
                name={getPriorityIcon(product.priority) as any} 
                size={14} 
                color="white" 
              />
              <Text style={styles.priorityText}>
                {product.priority.charAt(0).toUpperCase() + product.priority.slice(1)}
              </Text>
            </LinearGradient>
          </View>

          {product.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#5352ed', '#3742fa']}
                  style={[styles.progressFill, { width: `${completionPercentage}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.progressText}>
                {product.quantityReceived}/{product.quantity} received ({completionPercentage.toFixed(0)}%)
              </Text>
            </View>
          </View>

          {product.purchasedBy && (
            <View style={styles.purchasedSection}>
              <Text style={styles.sectionTitle}>Gift From</Text>
              <Text style={styles.purchasedBy}>{product.purchasedBy}</Text>
            </View>
          )}

          {product.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notes}>{product.notes}</Text>
            </View>
          )}

          {product.productURL && (
            <TouchableOpacity style={styles.urlButton} onPress={handleOpenURL}>
              <Ionicons name="link" size={20} color="#5352ed" />
              <Text style={styles.urlButtonText}>View Product Online</Text>
              <Ionicons name="open" size={16} color="#5352ed" />
            </TouchableOpacity>
          )}

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Added:</Text>
              <Text style={styles.detailValue}>
                {product.dateAdded.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantity:</Text>
              <Text style={styles.detailValue}>{product.quantity}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Value:</Text>
              <Text style={styles.detailValue}>
                ${(product.price * product.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {product.isPurchased ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleMarkAsNeeded}>
            <Ionicons name="refresh" size={20} color="#5352ed" />
            <Text style={styles.secondaryButtonText}>Mark as Needed</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleMarkAsPurchased}>
            <Ionicons name="checkmark" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Mark as Purchased</Text>
          </TouchableOpacity>
        )}
      </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
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
  imageSection: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 32,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ed573',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  infoSection: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#2f3542',
    marginRight: 16,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5352ed',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  categoryBadge: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#747d8c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#747d8c',
    lineHeight: 24,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e1e5e9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#747d8c',
    fontWeight: '500',
  },
  purchasedSection: {
    marginBottom: 24,
  },
  purchasedBy: {
    fontSize: 16,
    color: '#2ed573',
    fontWeight: '600',
  },
  notesSection: {
    marginBottom: 24,
  },
  notes: {
    fontSize: 16,
    color: '#747d8c',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  urlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  urlButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#5352ed',
  },
  detailsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#747d8c',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
  },
  actionButtons: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5352ed',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f2f6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5352ed',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2f3542',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#747d8c',
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#5352ed',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});