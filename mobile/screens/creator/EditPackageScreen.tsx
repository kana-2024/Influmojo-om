import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomDropdown from '../../components/CustomDropdown';

interface EditPackageScreenProps {
  package: any;
  onClose: () => void;
  onSave: (updatedPackage: any) => void;
}

const EditPackageScreen: React.FC<EditPackageScreenProps> = ({ package: pkg, onClose, onSave }) => {
  const [platform, setPlatform] = useState(pkg.platform || '');
  const [contentType, setContentType] = useState(pkg.content_type || '');
  const [quantity, setQuantity] = useState(pkg.quantity?.toString() || '1');
  const [revisions, setRevisions] = useState(pkg.revisions?.toString() || '1');
  const [duration1, setDuration1] = useState(pkg.duration1 || '1 Minute');
  const [duration2, setDuration2] = useState(pkg.duration2 || '0 Seconds');
  const [price, setPrice] = useState(pkg.price?.toString() || '');
  const [description, setDescription] = useState(pkg.description || '');

  const platforms = ['Instagram', 'Facebook', 'Youtube', 'Snapchat'];
  const contentTypes = ['Story', 'Feed post', 'Carousel Post'];
  const quantities = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const durations1 = ['1 Minute', '2 Minutes', '3 Minutes', '4 Minutes', '5 Minutes'];
  const durations2 = ['0 Seconds', '15 Seconds', '30 Seconds', '45 Seconds'];

  const handleSave = () => {
    const updatedPackage = {
      ...pkg,
      platform,
      content_type: contentType,
      quantity: parseInt(quantity),
      revisions: parseInt(revisions),
      duration1,
      duration2,
      price: parseFloat(price),
      description,
    };
    onSave(updatedPackage);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Package</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Platform */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Choose Platform*</Text>
          <CustomDropdown
            value={platform}
            setValue={setPlatform}
            options={platforms}
            placeholder="Select Platform"
          />
        </View>

        {/* Content Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Select Content type*</Text>
          <CustomDropdown
            value={contentType}
            setValue={setContentType}
            options={contentTypes}
            placeholder="Select Content Type"
          />
        </View>

        {/* Quantity */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Quantity*</Text>
          <CustomDropdown
            value={quantity}
            setValue={setQuantity}
            options={quantities}
            placeholder="Select Quantity"
          />
        </View>

        {/* Revisions */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Revisions</Text>
          <TextInput
            style={styles.textInput}
            value={revisions}
            onChangeText={setRevisions}
            keyboardType="numeric"
            placeholder="Enter revisions"
            placeholderTextColor="#B0B0B0"
          />
        </View>

        {/* Duration */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Duration*</Text>
          <View style={styles.durationRow}>
            <View style={styles.durationField}>
              <CustomDropdown
                value={duration1}
                setValue={setDuration1}
                options={durations1}
                placeholder="Minutes"
              />
            </View>
            <View style={styles.durationField}>
              <CustomDropdown
                value={duration2}
                setValue={setDuration2}
                options={durations2}
                placeholder="Seconds"
              />
            </View>
          </View>
        </View>

        {/* Price */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Price (INR)*</Text>
          <TextInput
            style={styles.textInput}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="Enter price"
            placeholderTextColor="#B0B0B0"
          />
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Brief Description</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            placeholderTextColor="#B0B0B0"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8f4e8',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    padding: 4,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationField: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#f8f4e8',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#f37135',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f4e8',
  },
  cancelButtonText: {
    color: '#f37135',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#f37135',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#f8f4e8',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditPackageScreen; 
