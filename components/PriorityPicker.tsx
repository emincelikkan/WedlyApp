import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Priority } from '@/types';

interface PriorityPickerProps {
  selectedPriority: Priority;
  onPriorityChange: (priority: Priority) => void;
}

const priorityOptions = [
  {
    value: Priority.HIGH,
    label: 'High Priority',
    icon: 'flame',
    color: '#ff4757',
    description: 'Must have items'
  },
  {
    value: Priority.MEDIUM,
    label: 'Medium Priority',
    icon: 'star',
    color: '#ffa502',
    description: 'Would love to have'
  },
  {
    value: Priority.LOW,
    label: 'Low Priority',
    icon: 'leaf',
    color: '#2ed573',
    description: 'Nice to have'
  }
];

export function PriorityPicker({ selectedPriority, onPriorityChange }: PriorityPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Priority Level</Text>
      <View style={styles.optionsContainer}>
        {priorityOptions.map((option) => {
          const isSelected = selectedPriority === option.value;
          
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                isSelected && styles.selectedOption,
                { borderColor: option.color }
              ]}
              onPress={() => onPriorityChange(option.value)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color="white" 
                  />
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.optionLabel,
                    isSelected && styles.selectedLabel
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    isSelected && styles.selectedDescription
                  ]}>
                    {option.description}
                  </Text>
                </View>
                
                {isSelected && (
                  <View style={styles.checkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color={option.color} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
    borderColor: '#e1e5e9',
  },
  selectedOption: {
    backgroundColor: '#f8f9ff',
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 2,
  },
  selectedLabel: {
    color: '#2f3542',
  },
  optionDescription: {
    fontSize: 14,
    color: '#747d8c',
  },
  selectedDescription: {
    color: '#5a6c7d',
  },
  checkContainer: {
    marginLeft: 8,
  },
});