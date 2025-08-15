import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StorageService, RegistryInfo } from '@/utils/storage';
import { SharingService } from '@/utils/sharing';
import { Product } from '@/types';
import uuid from 'react-native-uuid';

export default function SettingsScreen() {
  const [registryInfo, setRegistryInfo] = useState<RegistryInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupleName, setCoupleName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const loadData = async () => {
    try {
      const info = await StorageService.loadRegistryInfo();
      const loadedProducts = await StorageService.loadProducts();
      
      if (info) {
        setRegistryInfo(info);
        setCoupleName(info.coupleName);
        setWeddingDate(info.weddingDate?.toLocaleDateString() || '');
      } else {
        // Create default registry info
        const newInfo: RegistryInfo = {
          coupleName: 'Happy Couple',
          registryId: uuid.v4() as string,
          shareCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        };
        await StorageService.saveRegistryInfo(newInfo);
        setRegistryInfo(newInfo);
        setCoupleName(newInfo.coupleName);
      }
      
      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSaveRegistryInfo = async () => {
    if (!registryInfo) return;

    try {
      const updatedInfo: RegistryInfo = {
        ...registryInfo,
        coupleName,
        weddingDate: weddingDate ? new Date(weddingDate) : undefined,
      };
      
      await StorageService.saveRegistryInfo(updatedInfo);
      setRegistryInfo(updatedInfo);
      setIsEditing(false);
      Alert.alert('Success', 'Registry information updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to save registry information');
    }
  };

  const handleShareRegistry = async () => {
    if (!registryInfo) return;

    try {
      await SharingService.shareRegistry(products, registryInfo);
    } catch (error) {
      Alert.alert('Error', 'Failed to share registry');
    }
  };

  const handleExportPDF = async () => {
    if (!registryInfo) return;

    try {
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

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your registry items and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAll();
              setProducts([]);
              setRegistryInfo(null);
              setCoupleName('');
              setWeddingDate('');
              Alert.alert('Success', 'All data cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color="#5352ed" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color="#a4b0be" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Registry Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registry Information</Text>
          
          <View style={styles.infoCard}>
            {isEditing ? (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Couple Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={coupleName}
                    onChangeText={setCoupleName}
                    placeholder="Enter couple name"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Wedding Date (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={weddingDate}
                    onChangeText={setWeddingDate}
                    placeholder="MM/DD/YYYY"
                  />
                </View>
                
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveRegistryInfo}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.infoDisplay}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Couple Name:</Text>
                  <Text style={styles.infoValue}>{registryInfo?.coupleName}</Text>
                </View>
                
                {registryInfo?.weddingDate && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Wedding Date:</Text>
                    <Text style={styles.infoValue}>
                      {registryInfo.weddingDate.toLocaleDateString()}
                    </Text>
                  </View>
                )}
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Share Code:</Text>
                  <Text style={styles.shareCode}>{registryInfo?.shareCode}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.editInfoButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="pencil" size={16} color="#5352ed" />
                  <Text style={styles.editInfoButtonText}>Edit Information</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Sharing & Export */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sharing & Export</Text>
          
          {renderSettingItem(
            'share',
            'Share Registry',
            'Share your registry with family and friends',
            handleShareRegistry
          )}
          
          {renderSettingItem(
            'document-text',
            'Export as PDF',
            'Generate a PDF version of your registry',
            handleExportPDF
          )}
          
          {renderSettingItem(
            'download',
            'Export as CSV',
            'Download registry data as spreadsheet',
            handleExportCSV
          )}
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          {renderSettingItem(
            'notifications',
            'Push Notifications',
            'Get notified when items are purchased',
            () => {},
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e1e5e9', true: '#5352ed' }}
              thumbColor="white"
            />
          )}
        </View>

        {/* Registry Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registry Statistics</Text>
          
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Items:</Text>
              <Text style={styles.statValue}>{products.length}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Items Received:</Text>
              <Text style={styles.statValue}>
                {products.filter(p => p.isPurchased).length}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Value:</Text>
              <Text style={styles.statValue}>
                ${products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
            <Ionicons name="trash" size={20} color="#ff4757" />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>WishList Wedding v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for your special day</Text>
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
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoDisplay: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#747d8c',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
  },
  shareCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5352ed',
    fontFamily: 'monospace',
  },
  editInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#f1f2f6',
    borderRadius: 8,
    gap: 8,
  },
  editInfoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5352ed',
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f2f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#747d8c',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#5352ed',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#747d8c',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#747d8c',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff4757',
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4757',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#747d8c',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#a4b0be',
  },
});