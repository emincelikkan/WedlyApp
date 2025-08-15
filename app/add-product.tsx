import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Product, Category, Priority } from '@/types';
import { StorageService } from '@/utils/storage';
import { PriorityPicker } from '@/components/PriorityPicker';
import uuid from 'react-native-uuid';

export default function AddProductScreen() {
  const params = useLocalSearchParams();
  const isEditing = !!params.productId;
  const preselectedCategory = params.category as Category;

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [productURL, setProductURL] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    preselectedCategory || Category.KITCHEN
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadProduct();
    }
  }, []);

  const loadProduct = async () => {
    try {
      const products = await StorageService.loadProducts();
      const product = products.find(p => p.id === params.productId);
      
      if (product) {
        setProductName(product.name);
        setDescription(product.description);
        setPrice(product.price.toString());
        setImageUri(product.imageUri);
        setProductURL(product.productURL || '');
        setPriority(product.priority);
        setQuantity(product.quantity.toString());
        setNotes(product.notes);
        setSelectedCategory(product.category);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to add images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateForm = (): boolean => {
    if (!productName.trim()) {
      Alert.alert('Validation Error', 'Please enter a product name');
      return false;
    }

    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return false;
    }

    if (!quantity.trim() || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const products = await StorageService.loadProducts();
      
      const productData: Product = {
        id: isEditing ? (params.productId as string) : (uuid.v4() as string),
        name: productName.trim(),
        description: description.trim(),
        price: parseFloat(price),
        imageUri,
        productURL: productURL.trim() || undefined,
        priority,
        quantity: parseInt(quantity),
        quantityReceived: 0,
        notes: notes.trim(),
        category: selectedCategory,
        dateAdded: isEditing 
          ? products.find(p => p.id === params.productId)?.dateAdded || new Date()
          : new Date(),
        isPurchased: false,
      };

      let updatedProducts: Product[];
      
      if (isEditing) {
        updatedProducts = products.map(p => 
          p.id === params.productId ? productData : p
        );
      } else {
        updatedProducts = [...products, productData];
      }

      await StorageService.saveProducts(updatedProducts);
      
      Alert.alert(
        'Success',
        `Product ${isEditing ? 'updated' : 'added'} successfully`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const products = await StorageService.loadProducts();
              const updatedProducts = products.filter(p => p.id !== params.productId);
              await StorageService.saveProducts(updatedProducts);
              
              Alert.alert('Success', 'Product deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2f3542" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditing ? 'Edit Product' : 'Add Product'}
          </Text>
          {isEditing && (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash" size={24} color="#ff4757" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Image Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Image</Text>
            <TouchableOpacity style={styles.imageContainer} onPress={showImageOptions}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.productImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={32} color="#a4b0be" />
                  <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.textInput}
                value={productName}
                onChangeText={setProductName}
                placeholder="Enter product name"
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the product (optional)"
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.textInput}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.inputLabel}>Quantity *</Text>
                <TextInput
                  style={styles.textInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="1"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product URL</Text>
              <TextInput
                style={styles.textInput}
                value={productURL}
                onChangeText={setProductURL}
                placeholder="https://example.com/product"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {Object.values(Category).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipSelected
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority Selection */}
          <View style={styles.section}>
            <PriorityPicker
              selectedPriority={priority}
              onPriorityChange={setPriority}
            />
          </View>

          {/* Additional Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special notes or preferences (optional)"
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#2f3542',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 16,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#a4b0be',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#2f3542',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  categoryChipSelected: {
    backgroundColor: '#5352ed',
    borderColor: '#5352ed',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#747d8c',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: 'white',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  saveButton: {
    backgroundColor: '#5352ed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#a4b0be',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});